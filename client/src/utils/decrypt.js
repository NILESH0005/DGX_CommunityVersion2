import CryptoJS from 'crypto-js';

const CRYPTO_SECRET = import.meta.env.VITE_API_CRYPTOSECRET

export async function decrypt(text) {
    return new Promise((resolve, reject) => {
        try {
             // Validate input
             if (!text || typeof text !== 'string') {
                throw new Error("Invalid input: text must be a non-empty string");
            }

            // Validate CRYPTO_SECRET
            if (!CRYPTO_SECRET || typeof CRYPTO_SECRET !== 'string') {
                throw new Error("Invalid CRYPTO_SECRET: ensure VITE_API_CRYPTOSECRET is set in your environment variables");
            }
            const textParts = text.split(':');
            if (textParts.length !== 2) {
                throw new Error("Invalid input format: expected 'iv:encryptedText'");
            }
            // let textParts = text.split(':');
            let iv = CryptoJS.enc.Hex.parse(textParts[0]);
            let encryptedText = CryptoJS.enc.Hex.parse(textParts[1]);
            let key = CryptoJS.enc.Hex.parse(CRYPTO_SECRET);

            let decrypted = CryptoJS.AES.decrypt(
                { ciphertext: encryptedText },
                key,
                { iv: iv, mode: CryptoJS.mode.CTR, padding: CryptoJS.pad.NoPadding }
            );
            // Convert decrypted data to a string
            const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

            // Validate decrypted result
            if (!decryptedText) {
                throw new Error("Decryption failed: result is empty or invalid");
            }
            resolve(decrypted.toString(CryptoJS.enc.Utf8));
        } catch (error) {
            // console.log(error);
            reject(error);
        }
    });
}