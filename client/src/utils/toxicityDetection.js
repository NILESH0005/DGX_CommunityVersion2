const API_URL = import.meta.env.VITE_TOXICITY_API_URL;
const API_KEY = import.meta.env.VITE_TOXICITY_API_KEY;
console.log("Toxicity API Config:", {
  API_URL: API_URL,
  API_KEY: API_KEY ? "Set" : "Not Set",
});
export const checkToxicity = async (text) => {
  // Convert array to string if needed
  const textToCheck = Array.isArray(text) ? text.join(" ") : text;

  console.log("checkToxicityFlag received:", textToCheck, "type:", typeof textToCheck);

  try {
    console.log("Sending toxicity check request:", {
      text: textToCheck.substring(0, 50) + (textToCheck.length > 50 ? "..." : ""),
      apiUrl: `${API_URL}/detect_toxicity`,
    });
    const response = await fetch(`${API_URL}/detect_toxicity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access-token": API_KEY,
      },
      body: JSON.stringify({
        text: textToCheck,
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
  const textToCheck = Array.isArray(text) ? text.join(" ") : text;

  console.log("checkToxicityFlag received:", textToCheck, "type:", typeof textToCheck);

  try {
    console.log("Sending toxicity check request:", {
      text: textToCheck.substring(0, 500) + (textToCheck.length > 500 ? "..." : ""),
    });

    const response = await fetch(`${API_URL}/detect_toxicity_flag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access-token": API_KEY,
      },
      body: JSON.stringify({
        text: textToCheck,
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
