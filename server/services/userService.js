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

      const htmlContent = `<p>Hello,</p><p>Your credentials:</p><p>Username: ${email}</p><p>Password: ${password}</p>`;

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

  let referCode;
  let codeExists = true;
  while (codeExists) {
    referCode = await referCodeGenerator(name, email, phoneNumber);
    const count = await User.count({
      where: { ReferalNumber: referCode, delStatus: 0 },
    });
    if (count === 0) codeExists = false;
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
    AddOnDt: new Date(),
    delStatus: 0,
  });

  logInfo(`User registered successfully: ${email}`);
  return {
    success: true,
    message: "User created successfully",
    data: { EmailId: newUser.EmailId },
  };
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
      // where: {
      //   [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
      // },
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
        response: { success: false, data: {}, message: "No users found" },
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

export const deleteUserService = async (userId) => {
  try {
    const deletedCount = await User.destroy({
      where: { UserID: userId },
    });

    if (deletedCount > 0) {
      const successMessage = "User deleted successfully";
      logInfo(successMessage);
      return {
        status: 200,
        response: { success: true, message: successMessage },
      };
    } else {
      const notFoundMessage = "User not found";
      logWarning(notFoundMessage);
      return {
        status: 404,
        response: { success: false, message: notFoundMessage },
      };
    }
  } catch (error) {
    logError(error);
    return {
      status: 500,
      response: { success: false, message: "Error deleting user" },
    };
  }
};

export const sendInviteService = async (userEmail, inviteeEmail) => {
  try {
    const user = await User.findOne({
      where: {
        EmailId: userEmail,
        [Op.or]: [{ delStatus: null }, { delStatus: 0 }],
      },
      attributes: ["ReferalNumber"],
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

    const plainTextMessage = `Welcome to the DGX Community!

We’re thrilled to have you join us. To complete your registration, click the link below:

${registrationLink}

If you did not sign up, ignore this email.

- The DGX Community Team`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #28a745;
                  color: white;
                  text-decoration: none;
                  border-radius: 5px;
                  font-size: 16px;
              }
              .footer {
                  font-size: 12px;
                  color: #777;
                  margin-top: 20px;
              }
          </style>
      </head>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <p>Welcome to the DGX Community!</p>
          <p>We’re thrilled to have you join us. To complete your registration, click below:</p>
          <p><a href="${registrationLink}" class="button">Complete Your Registration</a></p>
          <p>If you did not sign up, you can safely disregard this email.</p>
          <p>Thank you,<br>The DGX Community Team</p>
          <div class="footer">
              <p>This is an automated message. Please do not reply directly to this email.</p>
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

export const resetPassword = async (req, res) => {
  let success = false;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const warningMessage =
      "The data format is incorrect. Please ensure it meets the required format and try again.";
    logWarning(warningMessage);
    return res
      .status(400)
      .json({ success, data: errors.array(), message: warningMessage });
  }

  try {
    const { email, signature, password } = req.body;
    const SIGNATURE = process.env.SIGNATURE;

    const result = await resetPasswordService(
      email,
      signature,
      password,
      SIGNATURE
    );

    if (result.success) {
      logInfo(result.message);
      return res
        .status(200)
        .json({ success: true, data: {}, message: result.message });
    } else {
      logWarning(result.message);
      return res
        .status(200)
        .json({ success: false, data: {}, message: result.message });
    }
  } catch (err) {
    logError(err);
    return res.status(500).json({
      success: false,
      data: err,
      message: "Something went wrong please try again",
    });
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
  await User.create({
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

  return {
    success: true,
    message: "User added successfully",
    data: { EmailId, plainPassword },
  };
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
