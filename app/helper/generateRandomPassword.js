const crypto = require("crypto");

// For metting below criteria :
// Random Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character
async function generatePassword(length = 12) {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  //   const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const special = "!@#";
  const allChars = uppercase + lowercase + numbers + special;

  let password = "";

  // Ensure at least one character from each category
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += numbers[crypto.randomInt(numbers.length)];
  password += special[crypto.randomInt(special.length)];

  // Fill the rest of the password with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }

  // Shuffle the password
  password = password
    .split("")
    .sort(() => 0.5 - crypto.randomInt(2))
    .join("");

  return password;
}

module.exports = generatePassword;

// For Simple random passowrd :
// const randomPassword = crypto.randomBytes(4).toString("hex");
