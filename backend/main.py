from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json

from database import init_db, get_db, Deal
# from ai_engine import analyze_negotiation

app = FastAPI(title="Creator Copilot AI")

# Allow the React frontend (localhost:5173) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the database tables on startup
init_db()


# --- Request/Response schemas ---
class NegotiationRequest(BaseModel):
    offer_text: str
    brand_name: str = "Unknown Brand"


class NegotiationResponse(BaseModel):
    market_value_estimate: float | None
    risk_flags: list[str]
    suggested_counter: float | None
    counter_message: str


# --- Routes ---
@app.get("/")
def root():
    return {"status": "Creator Copilot backend is running"}


@app.post("/api/negotiation/analyze", response_model=NegotiationResponse)
def negotiation_analyze(req: NegotiationRequest, db: Session = Depends(get_db)):
    # 1. COMMENT OUT the real AI engine call temporarily:
    # result = analyze_negotiation(req.offer_text)

    # 2. ADD this mock dictionary so the rest of your app has data to process:
    result = {
        "market_value_estimate": 50000.0,
        "risk_flags": ["No Advance Payment", "Heavy Exclusivity"],
        "suggested_counter": 65000.0,
        "counter_message": "Hi! Thanks for the offer. Based on the deliverables, I'd like to propose ₹65,000."
    }

    deal = Deal(
        brand_name=req.brand_name,
        offer_text=req.offer_text,
        market_value_estimate=result.get("market_value_estimate"),
        suggested_counter=result.get("suggested_counter"),
        risk_flags=json.dumps(result.get("risk_flags", [])),
        stage="negotiating",
    )
    db.add(deal)
    db.commit()

    return result


@app.get("/api/deals")
def get_deals(db: Session = Depends(get_db)):
    deals = db.query(Deal).all()
    return [
        {
            "id": d.id,
            "brand_name": d.brand_name,
            "deal_amount": d.deal_amount,
            "stage": d.stage,
            "market_value_estimate": d.market_value_estimate,
            "suggested_counter": d.suggested_counter,
            "risk_flags": json.loads(d.risk_flags) if d.risk_flags else [],
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in deals
    ]
# --- ADD THIS AT THE VERY BOTTOM OF YOUR main.py FILE ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Calculates summary totals and tax compliance rules for the Indian context.
    Provides live statistics straight to the frontend dashboard elements.
    """
    deals = db.query(Deal).all()
    
    total_earned = 0.0
    active_deals_count = 0
    total_tds_deducted = 0.0
    total_gst_receivable = 0.0

    for d in deals:
        # Fall back to suggested counter if final deal amount isn't manually set yet
        amount = d.deal_amount if d.deal_amount else (d.suggested_counter or 0.0)
        
        # Track counts based on deal stages
        if d.stage == "paid":
            total_earned += amount
            
            # Compliance Math: Compute standard Indian tax liabilities
            # 10% TDS deduction under Sec 194J for professional content creation services
            total_tds_deducted += amount * 0.10
            # 18% GST tracking for invoicing compliance
            total_gst_receivable += amount * 0.18
        elif d.stage in ["negotiating", "contracted", "invoiced"]:
            active_deals_count += 1

    # Net payable amount a creator actually takes home after withholding
    net_take_home = total_earned - total_tds_deducted

    return {
        "totalEarned": total_earned,
        "activeDeals": active_deals_count,
        "totalTdsDeducted": total_tds_deducted,
        "totalGstReceivable": total_gst_receivable,
        "netTakeHome": net_take_home,
        "totalPipelineValue": sum(d.deal_amount or d.suggested_counter or 0.0 for d in deals)
    }


class StageUpdateRequest(BaseModel):
    stage: str
    deal_amount: float | None = None


@app.put("/api/deals/{deal_id}/stage")
def update_deal_stage(deal_id: str, req: StageUpdateRequest, db: Session = Depends(get_db)):
    """
    Updates the operational tracker stage and lock-in amount of a brand transaction.
    Valid stages: negotiating, contracted, invoiced, paid
    """
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Deal not found")
    
    deal.stage = req.stage
    if req.deal_amount is not None:
        deal.deal_amount = req.deal_amount
        
    db.commit()
    return {"message": f"Deal status successfully updated to {req.stage}"}
from datetime import datetime, timezone

@app.get("/api/deals/alerts")
def get_pipeline_alerts(db: Session = Depends(get_db)):
    """
    Scans active deals in the database and automatically flags them if:
    1. OVERDUE: The deal is marked as "invoiced" but has been sitting unpaid for more than 30 days.
    2. STALE: The deal is stuck in "negotiating" with no updates for more than 14 days.
    """
    # Fetch all records from the deals table
    all_deals = db.query(Deal).all()
    alerts = []
    
    # Get the current time in UTC (matching standard database timestamps)
    current_time = datetime.now(timezone.utc)
    
    for deal in all_deals:
        # Skip deals that are already completely finished/paid
        if deal.stage == "paid":
            continue
            
        # Ensure the record has a valid creation timestamp to perform math on
        if deal.created_at:
            # Force the database timestamp to be timezone-aware (UTC) for safe comparison
            created_at_utc = deal.created_at.replace(tzinfo=timezone.utc) if deal.created_at.tzinfo is None else deal.created_at
            days_passed = (current_time - created_at_utc).days
            
            # Condition 1: Invoice Tracking (Overdue Alert)
            if deal.stage == "invoiced" and days_passed > 30:
                alerts.append({
                    "deal_id": deal.id,
                    "brand_name": deal.brand_name,
                    "type": "OVERDUE",
                    "days_elapsed": days_passed,
                    "message": f"Invoice outstanding for {days_passed} days. Follow up for payment clearance."
                })
            
            # Condition 2: Pipeline Activity Tracking (Stale Alert)
            elif deal.stage == "negotiating" and days_passed > 14:
                alerts.append({
                    "deal_id": deal.id,
                    "brand_name": deal.brand_name,
                    "type": "STALE",
                    "days_elapsed": days_passed,
                    "message": f"Negotiation inactive for {days_passed} days. Send a follow-up pitch re-engagement."
                })
                
    return {
        "total_alerts": len(alerts),
        "alerts": alerts
    }
from fastapi import UploadFile, File, HTTPException
from pydantic import BaseModel
import fitz  # PyMuPDF

# 1. Define the structured response schema for the frontend
class ContractAnalysisResponse(BaseModel):
    brand_name: str
    payment_amount: float
    exclusivity_clause: str
    risk_flags: list[str]
    compliance_verdict: str

# 2. Create the Contract Analysis Endpoint
@app.post("/api/contracts/analyze", response_model=ContractAnalysisResponse)
async def analyze_contract_upload(file: UploadFile = File(...)):
    """
    Ingests a brand contract PDF, extracts its raw text, and scans it 
    against a compliance rule engine to flag risk factors.
    """
    # Guard clause: Ensure it is a PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF contracts are supported.")
    
    try:
        # Read file bytes directly from the upload stream
        pdf_bytes = await file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Extract text page by page
        raw_text = ""
        for page in doc:
            raw_text += page.get_text()
        doc.close()

        # Guard clause: Check if text extraction succeeded
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="The PDF file appears to be empty or scanned image-only.")

        # Convert text to lowercase for reliable keyword matching
        text_lower = raw_text.lower()
        risk_flags = []
        
        # --- COMPLIANCE RULE ENGINE ---
        
        # Rule A: Content Ownership / Perpetual Buyout
        if "perpetual" in text_lower or "ownership buyout" in text_lower or "intellectual property transfer" in text_lower:
            risk_flags.append("Aggressive Clause: Brand demands permanent ownership of your content assets.")
            
        # Rule B: Restrictive Exclusivity Window
        if "exclusivity" in text_lower or "competing brands" in text_lower or "lockout" in text_lower:
            risk_flags.append("Exclusivity Warning: Ensure the lockout period does not exceed standard campaign timelines.")
            
        # Rule C: Delayed Payment Milestones (Net-60/90)
        if "60 days" in text_lower or "90 days" in text_lower or "net 60" in text_lower or "net 90" in text_lower:
            risk_flags.append("Payment Delay Risk: Invoice clearance terms are set beyond 60+ days. Standard is Net 30.")
        elif "advance" not in text_lower and "upfront" not in text_lower and "deposit" not in text_lower:
            risk_flags.append("Missing Terms: No upfront advance payment buffer identified in this contract draft.")

        # Extract brand name snippet dynamically if "between" clause exists
        detected_brand = "Identified Brand Partner"
        for line in raw_text.split('\n'):
            if "between" in line.lower() or "agreement with" in line.lower():
                detected_brand = line.replace("This Agreement is made between", "").strip()
                break

        # Formulate final compliance verdict
        if len(risk_flags) > 0:
            verdict = f"Needs Revision: Triggered {len(risk_flags)} compliance flags. Negotiate terms before signing."
        else:
            verdict = "Clear: Contract terms align with standard creator compliance baselines."

        # Return structured output object
        return {
            "brand_name": detected_brand[:50],  # Truncate to keep UI clean
            "payment_amount": 0.0,             # Placeholder for numerical parser integration
            "exclusivity_clause": "Exclusivity restrictions detected in text." if "exclusivity" in text_lower else "None found",
            "risk_flags": risk_flags,
            "compliance_verdict": verdict
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing contract: {str(e)}")
    from fastapi import Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

# 1. Define the input request schema
class TaxCalculationRequest(BaseModel):
    gross_amount: float
    include_gst: bool = True
    tds_rate_percentage: float = 10.0  # Default 10% under Sec 194J

# 2. Define the structured response schema
class TaxCalculationResponse(BaseModel):
    base_gross_amount: float
    gst_added_amount: float
    tds_deducted_amount: float
    final_net_payout: float
    compliance_notes: str

# 3. Create the Tax & Compliance Calculator Endpoint
@app.post("/api/compliance/calculate-tax", response_model=TaxCalculationResponse)
async def calculate_creator_tax(payload: TaxCalculationRequest):
    base = payload.gross_amount
    gst_amount = (base * 0.18) if payload.include_gst else 0.0
    total_invoiced_amount = base + gst_amount
    
    tds_fraction = payload.tds_rate_percentage / 100.0
    tds_amount = base * tds_fraction
    net_payout = total_invoiced_amount - tds_amount
    
    notes = (
        f"Calculated using {payload.tds_rate_percentage}% TDS. "
        f"Note: As per CBDT guidelines, TDS is deducted only on the base value of Rs. {base:,.2f}, "
        f"excluding the GST component."
    )
    
    return {
        "base_gross_amount": round(base, 2),
        "gst_added_amount": round(gst_amount, 2),
        "tds_deducted_amount": round(tds_amount, 2),
        "final_net_payout": round(net_payout, 2),
        "compliance_notes": notes
    }