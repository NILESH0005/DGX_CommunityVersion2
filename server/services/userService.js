import db from "../models/index.js";
import bcrypt from "bcryptjs";
import { generatePassword, referCodeGenerator } from "../utility/index.js";
import { mailSender } from "../helper/index.js";
import { logWarning, logInfo, logError } from "../helper/index.js";
import jwt from "jsonwebtoken";
import { Op } from "sequelize"; // ✅ direct import
import { encrypt } from "../utility/encrypt.js";

const User = db.User;
const JWT_SECRET = process.env.JWTSECRET;
const BASE_LINK = process.env.RegistrationLink;
const SIGNATURE = process.env.SIGNATURE;

export const verifyUserAndSendPassword = async (email) => {
  const user = await User.findOne({ where: { EmailId: email, delStatus: 0 } });
  if (!user) {
    return {
      status: 200,
      response: {
        success: false,
        message: "Access denied. You are not yet a part of this community.",
      },
    };
  }

  if (user.FlagPasswordChange !== 0) {
    return {
      status: 200,
      response: {
        success: false,
        message: "Credentials already generated, go to login",
      },
    };
  }

  const password = await generatePassword(10);
  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(password, salt);

  let success = false;
  let referCode;
  while (!success) {
    referCode = await referCodeGenerator(
      user.Name,
      user.EmailId,
      user.MobileNumber
    );
    const count = await User.count({
      where: { ReferalNumber: referCode, delStatus: 0 },
    });
    if (count === 0) {
      const referCount = user.Category === "Faculty" ? 10 : 2;

      await User.update(
        {
          Password: secPass,
          AuthLstEdt: user.Name,
          editOnDt: new Date(),
          ReferalNumber: referCode,
          ReferalNumberCount: referCount,
        },
        { where: { EmailId: email, delStatus: 0 } }
      );

      const message = `Hello, Welcome to the DGX Community! Your credentials:
        Username: ${email}
        Password: ${password}`;

      // Updated HTML Template
      const htmlContent = `
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "Raleway", sans-serif;
            font-size: 13px;
            color: #333;
            line-height: 1.6;
        }
        .container {
            width: 750px;
            margin: 0 auto;
            padding: 20px;
            background: #013d54;
            border-radius: 5px;
            color: #ffffff;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #76b900;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 15px;
        }
        .footer {
            font-size: 10px;
            color: #ffcb83;
            margin-top: 20px;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="container">
        <div style="text-align:center;">
            <img src="http://117.55.242.133:3000/assets/nvidiapp-Lvu2GrY9.png" width="200px" alt="DGX Logo">
        </div>
        <p>Hi ${user.Name},</p>
        <p>We’re thrilled to have you join the <strong>NVIDIA DGX Community!</strong> You’re just one step away from
            unlocking a world of insights, collaboration, and innovation. To complete your registration, please verify
            your email using the credentials below:</p>

        <p style="font-size:120%;font-weight:bold;">
          Email: ${email}<br/>
          Password: ${password}
        </p>

        <p><strong>Why Verify?</strong></p>
        <ul>
            <li>Full Access: Once verified, you’ll gain full access to our exclusive DGX Community.</li>
            <li>Stay Secure: This quick step helps us keep your account safe and ensures your information stays private.</li>
        </ul>

        <p><strong>Important Information:</strong></p>
        <ul>
            <li>Your credentials are valid for a single use at first login.</li>
            <li>Do not share them with anyone. Global Infoventures Pvt. Ltd. will never ask for this via phone, chat, or email.</li>
        </ul>

        

        <p style="margin-top:20px;">We can’t wait to see what you’ll bring to the <strong>NVIDIA DGX Community</strong>. Let’s get started!</p>

        <p>Best Regards,<br>The DGX Community Team<br>Global Infoventures Pvt. Ltd.</p>

        <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>`;

      const mailsent = await mailSender(email, message, htmlContent);
      if (mailsent.success) {
        success = true;
        logInfo(`Mail sent successfully to ${email}`);
        return {
          status: 200,
          response: {
            success: true,
            message: "Mail sent successfully",
            data: { username: email },
          },
        };
      } else {
        logError(new Error("Mail isn't sent successfully"));
        return {
          status: 200,
          response: {
            success: false,
            message: "Mail isn't sent successfully",
            data: { username: email },
          },
        };
      }
    }
  }
};

export const registerUser = async ({
  ReferalNumber,
  name,
  email,
  password,
  collegeName,
  phoneNumber,
  category,
  designation,
}) => {
  const referalNumberCount = category === "F" ? 10 : 2;
  const FlagPasswordChange = 1;

  // 1. Check existing user
  const existingUser = await User.count({
    where: { EmailId: email, delStatus: 0 },
  });
  if (existingUser > 0) {
    return {
      success: false,
      message:
        "An account with this email address already exists. Please log in or use a different email to register.",
    };
  }

  // 2. Validate referral
  const inviter = await User.findOne({
    where: { ReferalNumber, delStatus: 0 },
  });
  if (!inviter || inviter.ReferalNumberCount <= 0) {
    return {
      success: false,
      message:
        "This referral code has no remaining credits. Please try again with a different referral code.",
    };
  }

  // 3. Deduct referral credit
  inviter.ReferalNumberCount -= 1;
  await inviter.save();

  // 4. Hash password
  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(password, salt);

  // 5. Generate referral code
  let referCode;
  let codeExists = true;
  while (codeExists) {
    referCode = await referCodeGenerator(name, email, phoneNumber);
    const count = await User.count({
      where: { ReferalNumber: referCode, delStatus: 0 },
    });
    if (count === 0) codeExists = false;
  }

  // 6. Create new user
  const newUser = await User.create({
    Name: name,
    EmailId: email,
    CollegeName: collegeName,
    MobileNumber: phoneNumber,
    Category: category,
    Designation: designation,
    ReferalNumberCount: referalNumberCount,
    ReferalNumber: referCode,
    Password: secPass,
    FlagPasswordChange,
    ReferedBy: inviter.UserID,
    AuthAdd: name,
    AddOnDt: new Date(),
    delStatus: 0,
  });

  // 7. Prepare Email
  const message = `Hello ${name}, Welcome to the DGX Community! Your credentials:
    Username: ${email}
    Password: ${password}`;

  const htmlContent = `
<html>
<head>
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: "Raleway", sans-serif; font-size: 13px; color: #333; line-height: 1.6; }
        .container { width: 750px; margin: 0 auto; padding: 20px; background: #013d54; border-radius: 5px; color: #ffffff; }
        .button { display: inline-block; padding: 12px 24px; background-color: #76b900; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; margin-top: 15px; }
        .footer { font-size: 10px; color: #ffcb83; margin-top: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div style="text-align:center;">
            <img src="http://192.168.12.9:3000/assets/nvidiapp-Lvu2GrY9.png" width="200px" alt="DGX Logo">
        </div>
        <p>Hi ${name},</p>
        <p>We’re thrilled to have you join the <strong>NVIDIA DGX Community!</strong> To complete your registration, here are your credentials:</p>

        <p style="font-size:120%;font-weight:bold;">
          Email: ${email}<br/>
          Password: ${password}
        </p>

        <p><strong>Why Verify?</strong></p>
        <ul>
            <li>Full Access: Once verified, you’ll gain full access to our exclusive DGX Community.</li>
            <li>Stay Secure: This quick step helps us keep your account safe and ensures your information stays private.</li>
        </ul>

        <div style="text-align:center;">
            <a href="https://your-domain.com/VerifyEmail?email=${encodeURIComponent(
              email
            )}" class="button">
                Verify My Account
            </a>
        </div>

        <p style="margin-top:20px;">We can’t wait to see what you’ll bring to the <strong>NVIDIA DGX Community</strong>. Let’s get started!</p>

        <p>Best Regards,<br>The DGX Community Team<br>Global Infoventures Pvt. Ltd.</p>

        <div class="footer">
            <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>`;

  // 8. Send Email
  const mailsent = await mailSender(email, message, htmlContent);

  if (mailsent.success) {
    logInfo(`User registered & mail sent successfully: ${email}`);
    return {
      success: true,
      message: "User created successfully. Verification email sent.",
      data: { EmailId: newUser.EmailId },
    };
  } else {
    logError(new Error("Mail not sent after registration"));
    return {
      success: true, // still registered
      message: "User created successfully but mail not sent.",
      data: { EmailId: newUser.EmailId },
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    const user = await User.findOne({
      where: { EmailId: email, delStatus: 0 },
    });
    if (!user) {
      logWarning(`Login failed for ${email} - user not found`);
      return {
        status: 200,
        response: {
          success: false,
          message: "Please try to login with correct credentials",
          data: {},
        },
      };
    }
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      logWarning(`Login failed for ${email} - invalid password`);
      return {
        status: 200,
        response: {
          success: false,
          message: "Please try to login with correct credentials",
          data: {},
        },
      };
    }
    const payload = {
      user: {
        id: user.EmailId,
        isAdmin: user.isAdmin,
        uniqueId: user.UserID,
      },
    };
    const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
    console.log(authtoken);

    logInfo(`User logged in successfully: ${email}`);
    return {
      status: 200,
      response: {
        success: true,
        message: "You logged in successfully",
        data: {
          authtoken,
          flag: user.FlagPasswordChange,
          isAdmin: user.isAdmin,
          isProfileImage: !!user.ProfilePicture,
        },
      },
    };
  } catch (error) {
    logError(error);
    return {
      status: 500,
      response: {
        success: false,
        message: "Something went wrong, please try again",
        data: {},
      },
    };
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({
      where: { EmailId: email, delStatus: 0 },
      attributes: [
        "UserID",
        "Name",
        "EmailId",
        "CollegeName",
        "MobileNumber",
        "Category",
        "Designation",
        "isAdmin",
        "ReferalNumberCount",
        "ReferalNumber",
        "ReferedBy",
        "ProfilePicture",
        "FlagPasswordChange",
        "AddOnDt",
        "UserDescription", // ✅ Added field
      ],
    });

    if (!user) {
      logWarning(`User not found for email: ${email}`);
      return {
        status: 200,
        response: {
          success: false,
          message: "User not found",
          data: {},
        },
      };
    }

    logInfo(`User fetched successfully: ${email}`);
    return {
      status: 200,
      response: {
        success: true,
        message: "User data fetched successfully",
        data: user.get({ plain: true }),
      },
    };
  } catch (error) {
    logError(error);
    return {
      status: 500,
      response: {
        success: false,
        message: "Something went wrong, please try again",
        data: {},
      },
    };
  }
};

export const changeUserPassword = async (
  email,
  currentPassword,
  newPassword
) => {
  try {
    const user = await User.findOne({
      where: { EmailId: email, delStatus: 0 },
    });

    if (!user) {
      logWarning(`Password change failed: User not found for ${email}`);
      return {
        status: 200,
        response: {
          success: false,
          message: "User not found",
          data: {},
        },
      };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.Password);
    if (!isMatch) {
      logWarning(
        `Password change failed: Incorrect current password for ${email}`
      );
      return {
        status: 200,
        response: {
          success: false,
          message: "Current password is incorrect",
          data: {},
        },
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({
      Password: hashedPassword,
      FlagPasswordChange: 1,
      AuthLstEdt: user.Name,
      editOnDt: new Date(),
    });

    logInfo(`Password changed successfully for ${email}`);
    return {
      status: 200,
      response: {
        success: true,
        message: "Password changed successfully",
        data: {},
      },
    };
  } catch (error) {
    logError(error);
    return {
      status: 500,
      response: {
        success: false,
        message: "Something went wrong, please try again",
        data: {},
      },
    };
  }
};

export const getAllUsersService = async () => {
  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
      },
      attributes: [
        "UserID",
        "Name",
        "EmailId",
        "CollegeName",
        "MobileNumber",
        "Category",
        "Designation",
        "FlagPasswordChange",
        "AddOnDt",
        "isAdmin",
        "delStatus",
      ],
    });

    if (users.length > 0) {
      logInfo("User data retrieved");
      return {
        status: 200,
        response: {
          success: true,
          data: users,
          message: "User data retrieved",
        },
      };
    } else {
      logWarning("No users found");
      return {
        status: 404,
        response: { success: false, data: [], message: "No users found" },
      };
    }
  } catch (error) {
    logError(error);
    return {
      status: 500,
      response: { success: false, message: "Something went wrong" },
    };
  }
};

export const deleteUserService = async (userId, adminName) => {
  try {
    const [updatedCount] = await User.update(
      { delStatus: 1, delOnDt: new Date(), AuthDel: adminName },
      {
        where: {
          UserID: userId,
          [Op.or]: [{ delStatus: null }, { delStatus: 0 }], // only delete if not already deleted
        },
      }
    );

    if (updatedCount > 0) {
      const successMessage = "User marked as deleted successfully";
      logInfo(`[Admin:${adminName}] ${successMessage}`);
      return { success: true, message: successMessage };
    } else {
      const notFoundMessage = "User not found or already deleted";
      logWarning(`[Admin:${adminName}] ${notFoundMessage}`);
      return { success: false, message: notFoundMessage };
    }
  } catch (error) {
    logError(error);
    return { success: false, message: "Error deleting user" };
  }
};

export const sendInviteService = async (userEmail, inviteeEmail) => {
  try {
    const user = await User.findOne({
      where: {
        EmailId: userEmail,
        [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
      },
      attributes: ["ReferalNumber", "Name"], // <-- Fetch user name also
    });

    if (!user) {
      logWarning("User not found");
      return {
        status: 404,
        response: { success: false, message: "User not found" },
      };
    }

    const baseLink = process.env.RegistrationLink;
    const emailEnc = await encrypt(inviteeEmail);
    const refercodeEnc = await encrypt(user.ReferalNumber);

    const registrationLink = `${baseLink}Register?email=${emailEnc}&refercode=${refercodeEnc}`;

    const plainTextMessage = `Hi,

${user.Name} has referred you to join the NVIDIA DGX Community, a powerful platform to enhance your skill sets in the field of AI & Deep Learning.

Why should you join?
- Connect with Experts
- Boost Your Expertise
- Collaborate and Innovate
- Stay Informed

Click here to register: ${registrationLink}

Best Regards,  
The DGX Community Team`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
              body {
                  font-family: "Raleway", sans-serif;
                  font-size: 13px;
                  color: #333;
                  line-height: 1.6;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #76b900;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 5px;
                  font-size: 16px;
                  margin: 0 auto;
                  font-weight: bold;
                  text-align: center;
              }
              .footer {
                  font-size: 10px;
                  color: #ffcb83;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body>
          <div style='width:750px;margin:0 auto; padding:10px; background:#013d54;border-radius:5px;color:#ffffff;'>
              <div style='margin:0 auto;text-align:center;'>
                  <img src="http://117.55.242.133:3000/assets/nvidiapp-Lvu2GrY9.png" width="200px" alt="DGX Community Logo" />
              </div>

              <p>Hi ${inviteeEmail.split("@")[0]},</p>

              <p><strong>${
                user.Name
              }</strong> has referred you to join the <strong>NVIDIA DGX Community</strong>, a powerful platform to enhance your skill sets in the field of AI & Deep Learning.</p>

              <p>As a valued <strong>NVIDIA DGX</strong> user, you're already harnessing the power of DGX for your AI and computing projects. Now, it’s time to take your experience to the next level! We’re excited to invite you to join the <strong>NVIDIA DGX Community</strong> - a place built specifically for users like you.</p>

              <p><strong>Why Should You Join?</strong></p>
              <ul>
                  <li><strong>Connect with Experts: </strong>Share your insights and challenges with fellow DGX users and industry experts.</li>
                  <li><strong>Boost Your Expertise:</strong> Learn advanced tips, tricks, and best practices to optimize your DGX setup.</li>
                  <li><strong>Collaborate and Innovate:</strong> Participate in discussions, collaborate on projects, and gain fresh perspectives.</li>
                  <li><strong>Stay Informed: </strong>Be the first to know about new updates, exclusive features, and exciting future releases.</li>
              </ul>

              <p style="text-align:center;">
                  <a href="${registrationLink}" class="button">Complete Your Registration</a>
              </p>

              <p>We hope that you flourish with your experience in AI research work, leveraging the knowledge of NVIDIA GPU platforms.</p>

              <p>Best Regards,<br>The DGX Community Team</p>
              <div class="footer">
                  <p>This is an automated message. Please do not reply directly to this email.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const mailSent = await mailSender(
      inviteeEmail,
      plainTextMessage,
      htmlContent
    );

    if (mailSent.success) {
      logInfo(`Invite link sent successfully to ${inviteeEmail}`);
      return {
        status: 200,
        response: {
          success: true,
          data: { registrationLink },
          message: "Mail sent successfully",
        },
      };
    } else {
      const errMsg = "Mail wasn't sent successfully";
      logError(new Error(errMsg));
      return {
        status: 500,
        response: { success: false, message: errMsg },
      };
    }
  } catch (err) {
    logError(err);
    return {
      status: 500,
      response: { success: false, message: "Something went wrong" },
    };
  }
};

export const resetPasswordService = async (
  email,
  signature,
  password,
  SIGNATURE
) => {
  try {
    const user = await User.findOne({
      where: {
        EmailId: email,
        delStatus: { [Op.or]: [0, null] },
      },
    });

    if (!user || user.FlagPasswordChange !== 2) {
      return { success: false, message: "Invalid or expired link" };
    }

    // Validate signature (coming only from env, not frontend)
    if (!SIGNATURE || SIGNATURE !== process.env.SIGNATURE) {
      return { success: false, message: "This link is not valid" };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user record
    await user.update({
      Password: hashedPassword,
      AuthLstEdt: user.Name,
      editOnDt: new Date(),
      FlagPasswordChange: 1,
    });

    return { success: true, message: "Password reset successfully" };
  } catch (error) {
    console.error("Error in resetPasswordService:", error);
    return { success: false, message: "Something went wrong" };
  }
};

export const deleteUser = async (userId, adminName) => {
  const user = await User.findOne({
    where: {
      UserID: userId,
      [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
    },
  });

  if (!user) {
    return { success: false, message: "User not found or already deleted" };
  }

  await user.update({
    delStatus: 1,
    delOnDt: new Date(),
    AuthDel: adminName,
  });

  return { success: true, data: user, message: "User deleted successfully" };
};

export const addUserService = async (userData) => {
  const { Name, EmailId, CollegeName, MobileNumber, Category, Designation } =
    userData;
  const referalNumberCount = Category === "F" ? 10 : 2;

  // Check if email exists
  const existing = await User.count({
    where: {
      EmailId,
      [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
    },
  });

  if (existing > 0) {
    return {
      success: false,
      message: "User with this email already exists",
      data: {},
    };
  }

  // Generate password & hash
  const plainPassword = await generatePassword(10);
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Generate unique referral code
  let referCode;
  while (true) {
    referCode = await referCodeGenerator(Name, EmailId, MobileNumber);
    const codeExists = await User.count({
      where: {
        ReferalNumber: referCode,
        [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
      },
    });
    if (codeExists === 0) break;
  }

  // Create user
  const newUser = await User.create({
    Name,
    EmailId,
    CollegeName,
    MobileNumber,
    Category,
    Designation,
    ReferalNumberCount: referalNumberCount,
    ReferalNumber: referCode,
    Password: hashedPassword,
    FlagPasswordChange: 0,
    AuthAdd: Name,
    AddOnDt: new Date(),
    delStatus: 0,
  });

  // Encrypt email for verification link
  const encryptedEmail = await encrypt(EmailId);
  const verificationLink = `${BASE_LINK}VerifyEmail?email=${encryptedEmail}&signature=${SIGNATURE}`;

  // Plain text mail
  const plainTextMessage = `Congratulations ${Name} 🎉

Welcome to the NVIDIA DGX Community!

Your account has been created successfully. 
To activate your account, please verify your email address using the link below:

Verify your account: ${verificationLink}

Steps after verification:
1. Login with your registered email.
3. You will be asked to change your password on first login.

Thank you,
The DGX Community Team`;

  // HTML Mail Content
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
          body {
              font-family: "Raleway", sans-serif;
              font-size: 13px;
              color: #333;
              line-height: 1.6;
          }
          .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #76b900;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              font-size: 16px;
              margin: 20px auto;
              font-weight: bold;
              text-align: center;
          }
          .footer {
              font-size: 10px;
              color: #ffcb83;
              margin-top: 20px;
          }
          .confetti {
              font-size: 30px;
              text-align: center;
              margin-bottom: 15px;
          }
      </style>
  </head>
  <body>
      <div style='width:750px;margin:0 auto; padding:15px; background:#013d54;border-radius:5px;color:#ffffff;'>
          <div style='margin:0 auto;text-align:center;'>
              <img src='http://117.55.242.133:3000/assets/nvidiapp-Lvu2GrY9.png' width='200px'>
          </div>

          <div class="confetti">🎉🎉 Congratulations 🎉🎉</div>

          <p>Hi ${Name},</p>
          <p>Welcome to the <strong>NVIDIA DGX Community</strong>! Your account has been successfully created.</p>

          <p><strong>Next Steps to Activate Your Account:</strong></p>
          <ol>
              <li>Click the button below to verify your email and activate your account.</li>
              <li>Login with your email: <strong>${EmailId}</strong>.</li>
              <li>On your first login, you will be prompted to change your password for security.</li>
          </ol>

          <p style="text-align:center;">
              <a href="${verificationLink}" class="button">Verify Your Account</a>
          </p>

          <p>We’re excited to have you as part of the DGX Community. Let’s innovate together!</p>

          <p>Best Regards,<br>The DGX Community Team</p>

          <div class="footer">
              <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
      </div>
  </body>
  </html>
  `;

  // Send email
  const mailSent = await mailSender(EmailId, plainTextMessage, htmlContent);

  if (mailSent.success) {
    logInfo(
      `User created and verification mail sent successfully to ${EmailId}`
    );
    return {
      success: true,
      message: "User added and verification mail sent successfully",
      data: { EmailId, plainPassword, verificationLink },
    };
  } else {
    logError(new Error("User created but mail not sent"));
    return {
      success: true,
      message: "User created but mail not sent",
      data: { EmailId, plainPassword },
    };
  }
};

export const sendContactEmailService = async (name, email, message) => {
  const adminEmail = "nilesh.thakur@giindia.com";

  const emailMessage = `New Contact Form Submission:
  
  Name: ${name}
  Email: ${email}
  Message: ${message}
  
  Received at: ${new Date().toLocaleString()}`;

  const htmlContent = `
    <h2>New Contact Form Submission</h2>
    <p><b>Name:</b> ${name}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Message:</b><br>${message.replace(/\n/g, "<br>")}</p>
    <p>Received at: ${new Date().toLocaleString()}</p>
  `;

  const mailSent = await mailSender(adminEmail, emailMessage, htmlContent);

  if (!mailSent.success) {
    return { success: false, message: "Failed to send email" };
  }

  // Confirmation to user
  const userHtml = `
    <p>Thank you for contacting us, ${name}!</p>
    <p>We have received your message and will get back to you soon.</p>
    <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
  `;
  await mailSender(email, `Thank you for contacting us, ${name}`, userHtml);

  return { success: true, message: "Your message has been sent successfully" };
};

export const passwordRecovery = async (email) => {
  try {
    const user = await User.findOne({
      where: { EmailId: email, delStatus: 0 },
      attributes: ["UserID", "EmailId", "Name"],
    });

    if (!user) {
      logWarning(`Password recovery failed: User not found for ${email}`);
      return {
        status: 200,
        response: {
          success: false,
          message: "User not found",
          data: {},
        },
      };
    }

    // Encrypt only the email
    const encryptedEmail = await encrypt(email);

    // Update FlagPasswordChange to 2
    await user.update({
      FlagPasswordChange: 2,
      AuthLstEdt: "Server",
      editOnDt: new Date(),
    });

    const registrationLink = `${BASE_LINK}ResetPassword?email=${encryptedEmail}&signature=${SIGNATURE}`;

    const message = `Hello ${user.Name},

We're here to help you regain access to your account on the NVIDIA DGX Community. 

To reset your password, click the link below:
${registrationLink}

Important Tips:
- Use a unique password
- Mix letters, numbers, and special characters
- Never share your password or reset link

The reset link is valid for one-time use and will expire in 10 minutes. 
If you did not request this, please ignore this email. Your account remains secure.

Thank you,
The DGX Community Team`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: "Raleway", sans-serif;
                font-size: 13px;
                color: #333;
                line-height: 1.6;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #76b900;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                margin: 0 auto;
                font-weight: bold;
                text-align: center;
            }
            .footer {
                font-size: 10px;
                color: #ffcb83;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div style='width:750px;margin:0 auto; padding:10px; background:#013d54;border-radius:5px;color:#ffffff;'>
            <div style='margin:0 auto;text-align:center;'>
                <img src='http://192.168.12.9:3000/assets/nvidiapp-Lvu2GrY9.png' width='200px'>
            </div>

            <p>Hi ${user.Name},</p>

            <p>We're here to help you regain access to your account on the <strong>NVIDIA DGX Community</strong>. 
           </p>

            <p><strong>To reset your password, please click the button below:</strong></p>
            <p style="text-align:center;">
                <a href="${registrationLink}" class="button">Reset Your Password</a>
            </p>

            <p><strong>Important Tips for Keeping Your Password Safe:</strong></p>
            <ul>
                <li>Use a unique password that you don’t use for other accounts.</li>
                <li>Your password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.</li>
                <li>Avoid sharing your password with anyone.</li>
            </ul>

            <p><strong>Important Information:</strong></p>
            <ul>
                <li>The reset link is valid for a single use only and will expire in 10 minutes.</li>
                
                <li>For your safety, never share your reset link or password with anyone. 
                Global Infoventures Pvt. Ltd. will never ask for your password via email or any other means.</li>
            </ul>
            <p>If you did not request a password reset, please ignore this email. Your account remains secure.</p>
            <p>If you have any further questions or need assistance, feel free to reach out to our support team.</p>
            <p>We’re excited to have you back in the community!</p>

            <p>Best Regards,<br>The DGX Community Team</p>
            <div class="footer">
                <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailsent = await mailSender(email, message, htmlContent);

    if (mailsent.success) {
      logInfo(`Password reset link sent successfully to ${email}`);
      return {
        status: 200,
        response: {
          success: true,
          message: "Mail sent successfully",
          data: { registrationLink },
        },
      };
    } else {
      logError(new Error("Mail isn't sent successfully"));
      return {
        status: 200,
        response: {
          success: false,
          message: "Mail isn't sent successfully",
          data: {},
        },
      };
    }
  } catch (error) {
    logError(error);
    return {
      status: 500,
      response: {
        success: false,
        message: "Something went wrong, please try again",
        data: {},
      },
    };
  }
};
