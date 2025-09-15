const API_URL = import.meta.env.VITE_TOXICITY_API_URL;
const API_KEY = import.meta.env.VITE_TOXICITY_API_KEY;
console.log("Toxicity API Config:", {
  API_URL: API_URL,
  API_KEY: API_KEY ? "Set" : "Not Set",
});
export const checkToxicity = async (text) => {
  try {
    console.log("Sending toxicity check request:", {
      text: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
      apiUrl: `${API_URL}/detect_toxicity`,
    });
    const response = await fetch(`${API_URL}/detect_toxicity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access-token": API_KEY, // ✅ correct header
      },
      body: JSON.stringify({
        text: text,
        model: "meta-llama/Llama-3.2-3B-Instruct",
        tokenizer: "string",
      }),
    });
    console.log("Toxicity API Response Status:", response.status);
    console.log(
      "Toxicity API Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Toxicity check failed:", error);
    throw error;
  }
};

export const checkToxicityFlag = async (text) => {
  try {
    console.log("Sending toxicity check request:", {
      text: text.substring(0, 50) + "...",
    });

    const response = await fetch(`${API_URL}/detect_toxicity_flag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access-token": API_KEY, // ✅ correct header
      },
      body: JSON.stringify({
        text: text,
        model: "meta-llama/Llama-3.2-3B-Instruct",
        tokenizer: "string",
      }),
    });
    console.log("Toxicity Flag API Response Status:", response.status);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Toxicity flag check failed:", error);
    throw error;
  }
};
