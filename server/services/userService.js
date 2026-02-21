import db, { sequelize } from "../models/index.js";
import bcrypt from "bcryptjs";
import { generatePassword, referCodeGenerator } from "../utility/index.js";
import { mailSender } from "../helper/index.js";
import { logWarning, logInfo, logError } from "../helper/index.js";
import jwt from "jsonwebtoken";
import { Op, Sequelize } from "sequelize"; // ✅ direct import
import { encrypt } from "../utility/encrypt.js";

const User = db.User;
const RoleMaster = db.Role_Master;
const PageMaster = db.Page_Master;
const RolePageAccess = db.Role_Page_Access;

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
      user.MobileNumber,
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
        { where: { EmailId: email, delStatus: 0 } },
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

export const registerUser = async (
  {
    inviteCode,
    name,
    email,
    password,
    collegeName,
    phoneNumber,
    category,
    designation,
  },
  userInfo, // <-- newly added
) => {
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
    where: { ReferalNumber: inviteCode, delStatus: 0 },
  });
  if (!inviter || inviter.ReferalNumberCount <= 0) {
    return {
      success: false,
      message:
        "This referral code has no remaining credits. Please try again with a different referral code.",
    };
  }

  inviter.ReferalNumberCount -= 1;
  await inviter.save();

  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(password, salt);

  let referCode;
  let codeExists = true;
  while (codeExists) {
    referCode = await referCodeGenerator(name, email, phoneNumber);
    const count = await User.count({
      where: { ReferalNumber: referCode, delStatus: 0 },
    });
    if (count === 0) codeExists = false;
  }
  const authLstEdit = userInfo?.uniqueId || userInfo?.id || "System";
  const referralRole = await RoleMaster.findOne({
    where: {
      RoleName: "Referal Role",
      delStatus: 0,
    },
  });

  if (!referralRole) {
    throw new Error("Referral role not found");
  }

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
    AuthLstEdit: authLstEdit, // ✅ store admin ID here
    AddOnDt: new Date(),
    delStatus: 0,
    isAdmin: referralRole.RoleID,

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
              email,
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
      success: true, 
      message: "User created successfully but mail not sent.",
      data: { EmailId: newUser.EmailId },
    };
  }
};

export const loginUser = async (email, password, ipAddress, deviceInfo) => {
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

    // UPDATE LOGIN TRACKING
    const now = new Date();

    await User.update(
      {
        LastLoginDtTime: now,
        LoginCount: (user.LoginCount || 0) + 1,
      },
      { where: { UserID: user.UserID } },
    );

    await db.UserLoginLog.create({
      UserID: user.UserID,
      LogInDateTime: now,
      LogOutDateTime: null,
      IPAddress: ipAddress,
      DeviceInfo: JSON.stringify(deviceInfo),
      AddOnDt: now,
      delStatus: 0,
    });

    const payload = {
      user: {
        id: user.EmailId,
        isAdmin: user.isAdmin,
        uniqueId: user.UserID,
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });

    logInfo(
      `User logged in successfully: ${email}. Login count: ${
        (user.LoginCount || 0) + 1
      }`,
    );

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
          loginCount: (user.LoginCount || 0) + 1,
          lastLogin: now,
        },
      },
    };
  } catch (error) {
    logError("LOGIN ERROR:", error);
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
  newPassword,
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
        `Password change failed: Incorrect current password for ${email}`,
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
      AuthLstEdt: user.UserID,
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
    const [users] = await sequelize.query(`
      SELECT 
        u.UserID,
        u.Name,
        u.EmailId,
        u.CollegeName,
        u.MobileNumber,
        u.Category,
        u.Designation,
        u.FlagPasswordChange,
        u.AddOnDt,
        u.isAdmin as RoleID,
        u.delStatus,
        COALESCE(r.RoleName, 'No Role Assigned') as RoleName
      FROM Community_User u
      LEFT JOIN RoleMaster r ON u.isAdmin = r.RoleID AND r.delStatus = 0
      WHERE (u.delStatus IS NULL OR u.delStatus = 0)
      ORDER BY u.UserID
    `);

    if (users.length > 0) {
      logInfo("User data retrieved with role information");
      return {
        status: 200,
        response: {
          success: true,
          data: users,
          message: "User data retrieved with role information",
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
      response: {
        success: false,
        message: "Something went wrong",
        error: error.message,
      },
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
      },
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
      htmlContent,
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
  SIGNATURE,
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
      AuthLstEdt: user.UserID,
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

export const addUserService = async (userData, userInfo) => {
  const {
    Name,
    EmailId,
    CollegeName,
    MobileNumber,
    Category,
    Designation,
    roleId,
  } = userData;
  const referalNumberCount = Category === "F" ? 10 : 2;

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

  if (roleId) {
    const roleExists = await RoleMaster.findOne({
      where: {
        RoleID: roleId,
        delStatus: 0,
      },
    });

    if (!roleExists) {
      return {
        success: false,
        message: "Selected role does not exist",
        data: {},
      };
    }
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

  const addedBy = userInfo?.id || "System";
  const editedBy = userInfo?.uniqueId;

  // ✅ Create new user
  const newUser = await User.create({
    Name,
    EmailId,
    CollegeName,
    MobileNumber,
    Category,
    Designation,
    isAdmin: roleId || null,
    ReferalNumberCount: referalNumberCount,
    ReferalNumber: referCode,
    Password: hashedPassword,
    FlagPasswordChange: 0,
    AuthAdd: addedBy,
    AuthLstEdt: editedBy, // who last edited it (admin id)
    AddOnDt: new Date(),
    delStatus: 0,
  });

  // Encrypt email for verification
  const encryptedEmail = await encrypt(EmailId);
  const verificationLink = `${BASE_LINK}VerifyEmail?email=${encryptedEmail}&signature=${SIGNATURE}`;

  let roleName = "No role assigned";
  if (roleId) {
    const role = await RoleMaster.findOne({
      where: { RoleID: roleId },
      attributes: ["RoleName"],
    });
    roleName = role?.RoleName || "Assigned role";
  }
  // Email content (unchanged)
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

  const htmlContent = `...`; // keep your existing HTML

  const mailSent = await mailSender(EmailId, plainTextMessage, htmlContent);

  if (mailSent.success) {
    logInfo(
      `User created and verification mail sent successfully to ${EmailId}`,
    );
    return {
      success: true,
      message: "User added and verification mail sent successfully",
      data: { EmailId, plainPassword, verificationLink, roleId, roleName },
    };
  } else {
    logError(new Error("User created but mail not sent"));
    return {
      success: true,
      message: "User created but mail not sent",
      data: { EmailId, plainPassword, roleId, roleName },
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

export const addRoleService = async (roleData, userInfo) => {
  const { name } = roleData;

  if (!name) {
    return {
      success: false,
      message: "Role name is required",
      data: {},
    };
  }

  const existingRole = await RoleMaster.count({
    where: {
      RoleName: name.trim(),
      [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
    },
  });

  if (existingRole > 0) {
    return {
      success: false,
      message: "Role with this name already exists",
      data: {},
    };
  }
  const addedBy = userInfo?.uniqueId; // numeric UserID

  if (!addedBy) {
    return {
      success: false,
      message: "Invalid user session",
      data: {},
    };
  }

  const newRole = await RoleMaster.create({
    RoleName: name.trim(),
    AuthAdd: addedBy,
    AuthLstEdt: null,
    AddDel: null,
    delOnDt: null,
    editOnDt: null,
    AddOnDt: new Date(),
    delStatus: 0,
  });

  return {
    success: true,
    message: "Role added successfully",
    data: newRole,
  };
};

export const getRolesService = async () => {
  try {
    const roles = await RoleMaster.findAll({
      where: {
        [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
      },
      attributes: ["RoleID", "RoleName", "AuthAdd", "AddOnDt", "CanRoleEdit"],
      order: [["RoleName", "ASC"]], 
    });

    if (!roles || roles.length === 0) {
      logInfo("No roles found in the database");
      return {
        success: true,
        message: "No roles found",
        data: [],
      };
    }

    logInfo(`Fetched ${roles.length} roles successfully`);
    return {
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    };
  } catch (err) {
    console.error("GET ROLES SERVICE ERROR 👉", err);
    logError(err);

    return {
      success: false,
      message: err.message || "Error fetching roles",
      data: [],
    };
  }
};

export const getPagesService = async () => {
  try {
    const pages = await PageMaster.findAll({
      where: {
        [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
      },
      attributes: ["PageID", "PageName", "DisplayName", "MenuType"],
      order: [["PageName", "ASC"]],
    });

    if (!pages || pages.length === 0) {
      logInfo("No Pages found in the database");
      return {
        success: true,
        message: "No Pages found",
        data: [],
      };
    }

    logInfo(`Fetched ${pages.length} Pages successfully`);
    return {
      success: true,
      message: "Pages fetched successfully",
      data: pages,
    };
  } catch (err) {
    console.error("GET Pages SERVICE ERROR 👉", err);
    logError(err);

    return {
      success: false,
      message: err.message || "Error fetching roles",
      data: [],
    };
  }
};

export const assignPagesToRoleService = async (roleId, pageIds, userInfo) => {
  try {
    // Validate input
    if (!roleId || !pageIds || !Array.isArray(pageIds)) {
      return {
        success: false,
        message: "Role ID and page IDs array are required",
        data: {},
      };
    }

    // Validate pageIds array
    if (pageIds.length === 0) {
      return {
        success: false,
        message: "At least one page must be selected",
        data: {},
      };
    }

    const addedBy = userInfo?.uniqueId; // numeric UserID from userInfo

    if (!addedBy) {
      return {
        success: false,
        message: "Invalid user session",
        data: {},
      };
    }

    console.log("Service received:", { roleId, pageIds, addedBy });

    // Validate role exists
    const role = await RoleMaster.findOne({
      where: {
        RoleID: roleId,
        delStatus: 0,
      },
    });

    if (!role) {
      return {
        success: false,
        message: "Role not found",
        data: {},
      };
    }

    console.log("Role found:", role.RoleName);

    // Validate all pages exist
    const pages = await PageMaster.findAll({
      where: {
        PageID: pageIds,
        delStatus: 0,
      },
    });

    if (pages.length !== pageIds.length) {
      const foundPageIds = pages.map((p) => p.PageID);
      const missingPages = pageIds.filter((id) => !foundPageIds.includes(id));
      return {
        success: false,
        message: `Some pages not found: ${missingPages.join(", ")}`,
        data: {},
      };
    }

    console.log("All pages validated");

    // Use transaction for bulk operations
    const transaction = await sequelize.transaction();

    try {
      // First, check if there are existing records for this role
      const existingRecords = await RolePageAccess.findAll({
        where: {
          RoleID: roleId,
          delStatus: 0,
        },
        transaction,
      });

      console.log("Existing records found:", existingRecords.length);

      if (existingRecords.length > 0) {
        // Soft delete existing records
        await RolePageAccess.update(
          {
            Access: 0,
            editOnDt: new Date(),
            AuthLstEdt: addedBy.toString(), // Convert to string to match AuthAdd type
            delStatus: 1, // Soft delete old records
          },
          {
            where: {
              RoleID: roleId,
              delStatus: 0,
            },
            transaction,
          },
        );
        console.log("Soft deleted existing records");
      }

      // Create new access records for selected pages
      const accessRecords = pageIds.map((pageId) => ({
        RoleID: roleId,
        PageID: pageId,
        Access: 1,
        AuthAdd: addedBy.toString(), // Convert to string
        AuthLstEdt: null, // Initially null
        AuthDel: null, // Initially null
        delOnDt: null, // Initially null
        AddOnDt: new Date(),
        editOnDt: null, // Initially null
        delStatus: 0,
      }));

      console.log("Creating access records:", accessRecords.length);

      // Check if any records already exist (even with delStatus = 1)
      const existingPageAccess = await RolePageAccess.findAll({
        where: {
          RoleID: roleId,
          PageID: pageIds,
        },
        transaction,
      });

      console.log("Existing page access found:", existingPageAccess.length);

      const existingMap = new Map();
      existingPageAccess.forEach((record) => {
        existingMap.set(`${record.RoleID}-${record.PageID}`, record);
      });

      for (const record of accessRecords) {
        const key = `${record.RoleID}-${record.PageID}`;
        const existingRecord = existingMap.get(key);

        if (existingRecord) {
          await RolePageAccess.update(
            {
              Access: 1,
              AuthAdd: addedBy.toString(), // Convert to string
              AuthLstEdt: addedBy.toString(), // Convert to string
              editOnDt: new Date(),
              delStatus: 0,
            },
            {
              where: {
                id: existingRecord.id,
              },
              transaction,
            },
          );
          console.log(`Updated existing record for page ${record.PageID}`);
        } else {
          await RolePageAccess.create(record, { transaction });
          console.log(`Created new record for page ${record.PageID}`);
        }
      }

      await transaction.commit();
      console.log("Transaction committed");

      // Get all pages with their access status for this role
      const allPages = await PageMaster.findAll({
        where: { delStatus: 0 },
        attributes: ["PageID", "PageName"],
        order: [["PageName", "ASC"]],
      });

      const roleAccess = await RolePageAccess.findAll({
        where: {
          RoleID: roleId,
          delStatus: 0,
          Access: 1,
        },
        attributes: ["PageID"],
      });

      const accessiblePageIds = roleAccess.map((ra) => ra.PageID);

      const pagesWithAccess = allPages.map((page) => ({
        PageID: page.PageID,
        PageName: page.PageName,
        Access: accessiblePageIds.includes(page.PageID) ? 1 : 0,
      }));

      return {
        success: true,
        message: "Pages assigned to role successfully",
        data: {
          role: {
            RoleID: role.RoleID,
            RoleName: role.RoleName,
          },
          pages: pagesWithAccess,
          accessiblePages: accessiblePageIds.length,
          totalPages: allPages.length,
        },
      };
    } catch (error) {
      await transaction.rollback();
      console.error("Transaction rolled back:", error);
      return {
        success: false,
        message: "Database error while assigning pages to role",
        data: { error: error.message },
      };
    }
  } catch (error) {
    console.error("Service error:", error);
    return {
      success: false,
      message: error.message || "Error assigning pages to role",
      data: {},
    };
  }
};

export const getRolePageAccessReportService = async () => {
  try {
    // Get all records from rolepageaccess (including Access = 0 for removed access)
    const rolePageAccess = await RolePageAccess.findAll({
      where: { delStatus: 0 }, // Only get non-deleted records
      attributes: [
        "id",
        "RoleID",
        "PageID",
        "Access", // Include Access field (0 or 1)
        "AuthAdd",
        "AddOnDt",
        "AuthLstEdt",
        "editOnDt",
      ],
      order: [
        ["RoleID", "ASC"],
        ["PageID", "ASC"],
      ],
      raw: true,
    });

    if (rolePageAccess.length === 0) {
      return {
        success: true,
        message: "No role-page access records found",
        data: [],
        summary: {
          totalRoles: 0,
          totalAssignments: 0,
          activeAccess: 0,
          inactiveAccess: 0,
        },
      };
    }

    const roleIds = [...new Set(rolePageAccess.map((r) => r.RoleID))];
    const pageIds = [...new Set(rolePageAccess.map((r) => r.PageID))];

    const roles = await RoleMaster.findAll({
      where: {
        RoleID: roleIds,
        delStatus: 0,
      },
      attributes: ["RoleID", "RoleName"],
      raw: true,
    });

    const pages = await PageMaster.findAll({
      where: {
        PageID: pageIds,
        delStatus: 0,
      },
      attributes: ["PageID", "PageName"],
      raw: true,
    });

    const roleMap = {};
    roles.forEach((role) => {
      roleMap[role.RoleID] = role.RoleName;
    });

    const pageMap = {};
    pages.forEach((page) => {
      pageMap[page.PageID] = page.PageName;
    });

    // Group by RoleID
    const groupedByRole = {};
    rolePageAccess.forEach((record) => {
      const roleId = record.RoleID;
      const roleName = roleMap[roleId] || "Unknown Role";
      const pageName = pageMap[record.PageID] || "Unknown Page";

      if (!groupedByRole[roleId]) {
        groupedByRole[roleId] = {
          RoleID: roleId,
          RoleName: roleName,
          TotalPages: 0,
          ActivePages: 0,
          Pages: [],
        };
      }

      groupedByRole[roleId].Pages.push({
        RecordID: record.id,
        PageID: record.PageID,
        PageName: pageName,
        Access: record.Access, // Include Access status
        AssignedBy: record.AuthAdd,
        AssignedOn: record.AddOnDt,
        LastEditedBy: record.AuthLstEdt,
        LastEditedOn: record.editOnDt,
      });

      groupedByRole[roleId].TotalPages++;
      if (record.Access === 1) {
        groupedByRole[roleId].ActivePages++;
      }
    });

    const report = Object.values(groupedByRole).sort(
      (a, b) => a.RoleID - b.RoleID,
    );

    // Calculate summary statistics
    const activeAccess = rolePageAccess.filter((r) => r.Access === 1).length;
    const inactiveAccess = rolePageAccess.filter((r) => r.Access === 0).length;

    return {
      success: true,
      message: "Role-page access report generated successfully",
      data: report,
      summary: {
        totalRoles: report.length,
        totalAssignments: rolePageAccess.length,
        activeAccess: activeAccess,
        inactiveAccess: inactiveAccess,
        rolesNotFound: roleIds.filter((id) => !roleMap[id]).length,
        pagesNotFound: pageIds.filter((id) => !pageMap[id]).length,
      },
    };
  } catch (error) {
    console.error("Error in getRolePageAccessReportService:", error);
    return {
      success: false,
      message: "Failed to generate role-page access report",
      data: [],
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
};

export const assignSingleRoleService = async (
  userId,
  roleId,
  currentUserId,
) => {
  try {
    const user = await User.findOne({
      where: {
        UserID: userId,
        delStatus: 0,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
        data: {},
      };
    }

    // Validate roleId (should be a positive number)
    if (!roleId || roleId <= 0) {
      return {
        success: false,
        message: "Invalid role ID. Role ID must be a positive number.",
        data: {},
      };
    }

    // Update user with the role ID in isAdmin column
    await User.update(
      {
        isAdmin: roleId, // Store role ID in isAdmin column
        AuthLstEdt: currentUserId.toString(),
        editOnDt: new Date(),
      },
      {
        where: {
          UserID: userId,
        },
      },
    );

    return {
      success: true,
      message: "User role assigned successfully",
      data: {
        userId: userId,
        roleId: roleId,
        updatedBy: currentUserId,
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error("Error in assignSingleRoleService:", error);
    return {
      success: false,
      message: "Failed to assign role to user",
      data: {},
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
};

export const getUserRoleService = async (userId) => {
  try {
    const user = await User.findOne({
      where: {
        UserID: userId,
        delStatus: 0,
      },
      attributes: [
        "UserID",
        "Name",
        "EmailId",
        "isAdmin", // This will store the role ID (1, 2, 3, 4, etc.)
        "AuthLstEdt",
        "editOnDt",
      ],
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
        data: null,
      };
    }

    // The isAdmin column now stores the role ID
    // 0 = no role, 1 = Admin, 2 = Head Of Department, 3 = HOD, 4 = Faculty, etc.
    const roleId = user.isAdmin || 0; // Default to 0 if null

    return {
      success: true,
      message: "User role retrieved successfully",
      data: roleId > 0 ? roleId : null, // Return null if no role assigned
      userInfo: {
        UserID: user.UserID,
        Name: user.Name,
        EmailId: user.EmailId,
        roleId: roleId, // The role ID stored in isAdmin column
        lastEditedBy: user.AuthLstEdt,
        lastEditedOn: user.editOnDt,
      },
    };
  } catch (error) {
    console.error("Error in getUserRoleService:", error);
    return {
      success: false,
      message: "Failed to retrieve user role",
      data: null,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
};

export const removeUserRoleService = async (userId, currentUserId) => {
  try {
    const user = await User.findOne({
      where: {
        UserID: userId,
        delStatus: 0,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
        data: {},
      };
    }

    // Set isAdmin to 0 (no role)
    await User.update(
      {
        isAdmin: 0, // 0 means no role assigned
        AuthLstEdt: currentUserId.toString(),
        editOnDt: new Date(),
      },
      {
        where: {
          UserID: userId,
        },
      },
    );

    return {
      success: true,
      message: "User role removed successfully",
      data: {
        userId: userId,
        roleRemoved: true,
        updatedBy: currentUserId,
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error("Error in removeUserRoleService:", error);
    return {
      success: false,
      message: "Failed to remove user role",
      data: {},
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
};

export const removeUserRole = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        data: {},
      });
    }

    if (!currentUser || !currentUser.id) {
      return res.status(400).json({
        success: false,
        message: "Current user information is required",
        data: {},
      });
    }

    const result = await removeUserRoleService(userId, currentUser.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error("Error in removeUserRole controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove user role",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getPagesByRoleService = async (roleId) => {
  try {
    const mappings = await RolePageAccess.findAll({
      where: {
        RoleID: roleId,
        Access: 1,
        [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
      },
      attributes: ["PageID"],
    });

    const pageIds = mappings.map((m) => m.PageID);

    if (!pageIds.length) return [];

    const pages = await PageMaster.findAll({
      where: {
        PageID: pageIds,
        [Op.or]: [{ delStatus: 0 }, { delStatus: null }],
      },
      attributes: ["PageID", "PageName", "DisplayName", "MenuType"],
      order: [["PageID", "ASC"]],
    });

    return pages;
  } catch (error) {
    console.error("getPagesByRoleService Error:", error);
    throw error;
  }
};
