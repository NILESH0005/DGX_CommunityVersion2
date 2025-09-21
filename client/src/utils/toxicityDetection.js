// client/src/component/LMS Manager/SubmoduleCard.toxicity.js
const API_URL = import.meta.env.VITE_TOXICITY_API_URL;
const API_KEY = import.meta.env.VITE_TOXICITY_API_KEY;

console.log("Toxicity API Config:", {
  API_URL,
  API_KEY: API_KEY ? "Set" : "Not Set",
});

/**
 * Calls endpoint that returns both flag and reasons:
 * POST ${API_URL}/detect_toxicity_with_reason_and_flag
 *
 * @param {string|string[]} text - text or array of strings
 * @param {Object} [opts] - optional controls
 * @param {number} [opts.timeoutMs=8000]
 * @returns {Promise<{flag:number, reasons:string[], raw:Object}>}
 */
export const checkToxicityWithReasonAndFlag = async (text, opts = {}) => {
  const { timeoutMs = 8000 } = opts;
  const textToCheck = Array.isArray(text) ? text.join(" ") : text;

  console.log("checkToxicityWithReasonAndFlag received:", {
    preview: textToCheck.substring(0, 200) + (textToCheck.length > 200 ? "..." : ""),
    length: textToCheck.length,
  });

  if (!API_URL) {
    throw new Error("Toxicity API URL is not configured (VITE_TOXICITY_API_URL).");
  }

  const url = `${API_URL.replace(/\/+$/, "")}/detect_toxicity_with_reason_and_flag`;
  const body = {
    text: textToCheck,
    model: "meta-llama/Llama-3.2-3B-Instruct",
    tokenizer: "string",
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log("Sending toxicity request ->", { url, timeoutMs });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access-token": API_KEY || "",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(id);

    console.log("Toxicity API Response Status:", response.status);

    if (!response.ok) {
      // try to parse body for error details
      let errText;
      try {
        const errJson = await response.json();
        errText = JSON.stringify(errJson);
      } catch (e) {
        errText = await response.text().catch(() => "<no body>");
      }
      throw new Error(`Toxicity API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    const result = {
      flag: typeof data.flag === "number" ? data.flag : (data.flag ? 1 : 0),
      reasons: Array.isArray(data.reasons) ? data.reasons : (data.reasons ? [String(data.reasons)] : []),
      model: data.model,
      tokenizer: data.tokenizer,
      input_text_length: data.input_text_length,
      num_chunks: data.num_chunks,
      time_taken: data.time_taken,
      raw: data,
    };

    console.log("Toxicity result:", {
      flag: result.flag,
      reasons_preview: result.reasons.slice(0, 3),
    });

    return result;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Toxicity request timed out after", timeoutMs, "ms");
      throw new Error("Toxicity request timed out");
    }
    console.error("Toxicity check failed:", error);
    throw error;
  }
};

/*
Optional fallback examples (if your environment still supports older endpoints):
export const checkToxicity = async (text) => { ... }    // call /detect_toxicity
export const checkToxicityFlag = async (text) => { ... } // call /detect_toxicity_flag
*/
