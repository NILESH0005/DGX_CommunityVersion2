const generateCaptcha = async (length = 6) => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const allCharacters = lowercase + uppercase + numbers;

  let captcha = "";

  captcha += lowercase[Math.floor(Math.random() * lowercase.length)];
  captcha += uppercase[Math.floor(Math.random() * uppercase.length)];
  captcha += numbers[Math.floor(Math.random() * numbers.length)];

  for (let i = 0; i < length - 3; i++) {
    captcha += allCharacters[Math.floor(Math.random() * allCharacters.length)];
  }

  captcha = captcha
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
  return captcha;
};
export default generateCaptcha;
