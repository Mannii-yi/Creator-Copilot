import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def analyze_negotiation(offer_text: str) -> dict:
    """
    Takes a raw brand offer (pasted text) and returns:
    - market_value_estimate
    - risk_flags
    - suggested_counter
    - counter_message (ready-to-paste text)
    """

    prompt = f"""
You are a negotiation assistant for Indian social media creators dealing with brand deal offers.

A creator received this offer from a brand:
---
{offer_text}
---

Analyze it and respond ONLY with valid JSON (no markdown, no backticks, no extra text) in this exact format:
{{
  "market_value_estimate": <number, fair price in INR>,
  "risk_flags": ["<short risk description>", ...],
  "suggested_counter": <number, suggested counter price in INR>,
  "counter_message": "<a polite, ready-to-send counteroffer message the creator can paste directly to the brand>"
}}

Consider Indian creator economy norms: usage rights duration, exclusivity, payment timelines, and gifted product value.
If the offer mentions gifted products worth more than ₹20,000, mention TDS implications in risk_flags.
If usage rights are described as "perpetual" or "full" or "unlimited", flag it as a risk needing 3-4x premium pricing.
"""

    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Clean up in case Gemini wraps response in markdown code fences
    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.strip()

    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        result = {
            "market_value_estimate": None,
            "risk_flags": ["Could not parse AI response. Try again."],
            "suggested_counter": None,
            "counter_message": raw_text,
        }

    return result