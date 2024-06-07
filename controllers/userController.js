const Joi = require("joi");
const user_model = require("../models/userModel");
const bcrypt = require("bcrypt");
const encode = require("../middleware/token");

async function hashedPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.user_register = async (req, res) => {
  try {
    const { userName, email, password, phone, role } = req.body;
    const hash = await hashedPassword(password);

    const schema = Joi.object({
      userName: Joi.string().required().messages({
        "string.empty": "userName is a required field.",
      }),

      email: Joi.string().email().required().messages({
        "string.empty": "email is a required field.",
        "string.email": "please enter valid email.",
      }),
      password: Joi.string().min(6).max(16).required().messages({
        "string.empty": "Password is a required field.",
        "string.min": "Password must be at least 6 characters long.",
        "string.max": "Password must be at most 16 characters long.",
      }),
      phone: Joi.number().integer().min(1000000000).max(9999999999).messages({
        "number.base": "Phone number must be a number.",
        "number.integer": "Phone number must be an integer.",
        "number.min": "Phone number must be a 10-digit number.",
        "number.max": "Phone number must be a 10-digit number.",
      }),
      role: Joi.string().valid("admin", "superadmin").required().messages({
        "string.empty": `Role is a required field.`,
        "any.only": `Role must be either 'admin' or 'superadmin'.`,
      }),
    });

    const validation = schema.validate({
      userName: userName,
      email: email,
      password: password,
      phone: phone,
      role: role,
    });

    console.log("validation error==>>>", validation);

    if (validation.error) {
      return res.status(422).send({
        status: 422,
        message: validation.error.details.map((detail) => detail.message),
      });
    } else {
      const isMailExist = await user_model.findOne({ role, email });
      if (isMailExist) {
        return res.json({ msg: "An account with this email already exists." });
      }

      const addUser = new user_model({
        userName: userName,
        email: email,
        password: hash,
        phone: phone,
        role: role,
        image: [],
      });

      if (req.files && req.files.length > 0) {
        req.files.forEach(function (file) {
          addUser.image.push(process.env.BASE_URL + file.filename);
        });
      }

      const result = await addUser.save();
      if (result) {
        return res.json({
          success: true,
          status: 201,
          message: "User registered successfully!",
          user_details: result,
        });
      } else {
        return res.json({
          success: false,
          status: 400,
          message: "Failed to register user!",
        });
      }
    }
  } catch (error) {
    return res.status(500).send({
      status: 500,
      message: error.message,
    });
  }
};

exports.user_login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        "string.empty": "Email is a required field.",
        "string.email": "Please enter a valid email.",
      }),
      password: Joi.string().min(6).max(16).required().messages({
        "string.empty": "Password is a required field.",
        "string.min": "Password must be at least 6 characters long.",
        "string.max": "Password must be at most 16 characters long.",
      }),
      role: Joi.string().valid("admin", "superadmin").required().messages({
        "string.empty": "Role is a required field.",
        "any.only": "Role must be either 'admin' or 'superadmin'.",
      }),
    });

    const validation = schema.validate({ email, password, role });

    if (validation.error) {
      return res.status(422).send({
        status: 422,
        message: validation.error.details.map((detail) => detail.message),
      });
    }

    const user = await user_model.findOne({ email, role });
    if (!user) {
      return res
        .status(401)
        .json({ msg: "Entered email is not found or role is incorrect!" });
    }

    const isPasswordValid = await validatePassword(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ msg: "The password you entered is incorrect!" });
    }

    const token = await encode({
      id: user.id,
      user_name: user.userName,
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: "User login successfully!",
      token: token,
    });
  } catch (error) {
    return res.status(500).send({
      status: 500,
      message: error.message,
    });
  }
};

exports.update_user_profile = async (req, res) => {
  try {
    const id = req.user;
    console.log("id ===>>>", id);
    const { file } = req;
    const { userName, phone } = req.body;

    let image;
    if (req.file) {
      image = process.env.BASE_URL + file.filename;
    }

    let recodeData = {};
    if (req.file) {
      recodeData = {
        userName: userName,
        phone: phone,
        image: image,
      };
    } else {
      recodeData = {
        userName: userName,
        phone: phone,
      };
    }

    await user_model.findOneAndUpdate(
      { _id: id },
      { $set: recodeData },
      { new: true }
    );

    console.log("recodeData ===>>>", recodeData);

    const adminUpdate = await user_model.findOne({ _id: id });
    console.log("adminUpdate ===>>>", adminUpdate);

    return res
      .status(200)
      .json({ status: 200, message: "Admin Update Successfully", adminUpdate });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const id = req.user;

    const { oldPassword, newPassword, confirm_password } = req.body;

    const schema = Joi.object({
      oldPassword: Joi.string().min(6).max(16).required().messages({
        "string.empty": `please enter old password.`,
        "string.oldPassword": `Please enter valid oldPassword.`,
        "string.min": `Old Password must be at least 6 characters long.`,
        "string.max": `Old Password must be at least 16 characters short.`,
      }),
      newPassword: Joi.string().min(6).max(16).required().messages({
        "string.empty": `please enter new password.`,
        "string.min": `NewPassword must be at least 6 characters long.`,
        "string.max": `NewPassword must be at least 16 characters short.`,
      }),
      confirm_password: Joi.string().min(6).max(16).required().messages({
        "string.empty": `please enter confirm password password.`,
        "string.min": `confirmPassword must be at least 6 characters long.`,
        "string.max": `confirmPassword must be at least 16 characters short.`,
      }),
    });
    const validation = schema.validate({
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirm_password: confirm_password,
    });
    console.log("validation", validation);

    if (validation.error) {
      return res.status(422).send({
        status: 422,
        message: validation.error.details,
      });
    }

    if (newPassword != confirm_password) {
      return res.status(403).json({
        message: "Confirm password does not matched!",
      });
    }
    var data = await user_model.findOne({ _id: id });
    console.log("data--->>>", data);

    const validOldPassword = await validatePassword(oldPassword, data.password);
    if (!validOldPassword)
      return res.status(409).json({
        status: 409,
        message: "Old passsword doesn't matched",
      });

    const hashPassword = await hashedPassword(newPassword, confirm_password);

    var result = await user_model.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          password: hashPassword,
        },
      }
    );
    if (!result) {
      return res.json({
        status: 400,
        message: "something went wrong",
      });
    } else {
      return res.json({
        statusCode: 200,
        message: "password change successfully",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

exports.get_user_details = async (req, res) => {
  try {
    const id = req.user;
    const { role } = req.params;

    if (!["admin", "superadmin"].includes(role)) {
      return res.status(400).json({
        status: 400,
        message: "Role is either 'admin' or 'superadmin'.",
      });
    }

    const fetchDetails = await user_model.findOne({ _id: id, role });

    if (!fetchDetails) {
      return res.status(400).json({
        status: 400,
        message: "ID or role is incorrect.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "User details fetched successfully!",
      user_details: fetchDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: error.message,
    });
  }
};

exports.remove_user = async (req, res) => {
  try {
    const id = req.user;
    const { role } = req.params;

    
    if (!["admin", "superadmin"].includes(role)) {
      return res.status(400).json({
        status: 400,
        message: "Role is either 'admin' or 'superadmin'.",
      });
    }

    
    const user = await user_model.findOne({ _id: id, role });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found with the specified role and ID.",
      });
    }

   
    await user_model.deleteOne({ _id: id, role });

    return res.status(200).json({
      status: 200,
      message: "User removed successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: error.message,
    });
  }
};
