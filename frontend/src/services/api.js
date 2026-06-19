const API_BASE_URL = "http://127.0.0.1:8000";

export async function apiRequest(
  endpoint,
  options = {}
) {
  try {

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      options
    );

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status}`
      );
    }

    return await response.json();

  } catch(error){

    console.error(
      "API connection failed:",
      error
    );

    throw error;
  }
}