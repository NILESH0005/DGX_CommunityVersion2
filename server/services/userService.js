import db from "../models/index.js";
import bcrypt from "bcryptjs";
import { generatePassword, referCodeGenerator } from "../utility/index.js";
import { mailSender } from "../helper/index.js";
import { logWarning, logInfo, logError } from "../helper/index.js";
import jwt from "jsonwebtoken";

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
      where: {
        [db.Sequelize.Op.or]: [{ delStatus: null }, { delStatus: 0 }],
      },
    });

    if (users.length > 0) {
      const infoMessage = "User data retrieved";
      logInfo(infoMessage);
      return {
        status: 200,
        response: { success: true, data: users, message: infoMessage },
      };
    } else {
      const warningMessage = "No users found";
      logWarning(warningMessage);
      return {
        status: 404,
        response: { success: false, data: {}, message: warningMessage },
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
