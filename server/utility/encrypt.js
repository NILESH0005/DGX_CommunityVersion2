import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()
const CRYPTO_SECRET = process.env.CRYPTOSECRET;


export async function encrypt(text) {
    return new Promise((resolve, reject) => {
        try {
            const IV_LENGTH = 16;
            let iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(CRYPTO_SECRET, 'hex'), iv);
            let encrypted = cipher.update(text);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            resolve(iv.toString('hex') + ':' + encrypted.toString('hex'));
        } catch (error) {
            // console.log(error)
            reject(error);
        }
    });
}