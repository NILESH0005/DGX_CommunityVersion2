// Helper function to shuffle a string
function shuffleString(str) {
    const array = str.split(''); // Convert string to array of characters
    array.sort(() => Math.random() - 0.5); // Shuffle the array
    return array.join(''); // Convert array back to string
}
// Function to generate a 2-character salt
function generateSalt() {
    let salt = '';
    const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 2; i++) {
        salt += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
    }
    return salt;
}

// Async function to generate refer code
export async function referCodeGenerator(username, email, phoneNo) {
    // Combine parts (entire username, email, and phone number)
    let combinedString = username + email + phoneNo;

    // Remove non-alphanumeric characters and convert to uppercase
    combinedString = combinedString.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();

    // Ensure combinedString is at least 10 characters long
    while (combinedString.length < 10) {
        const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 65); // Random uppercase letter
        combinedString += randomChar;
    }

    // Shuffle the combined string
    combinedString = shuffleString(combinedString);

    // Add 2-character salt
    const salt = generateSalt();
    combinedString += salt;

    // Ensure final refer code is exactly 12 characters long
    combinedString = combinedString.substring(0, 10).toUpperCase(); // Take first 12 characters

    return combinedString;
}

