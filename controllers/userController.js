//Note : for findOne make it less strict and about profile pic
//clean modelsDb version

const User = require("../models/user-model.js");
const generateToken = require("../utils/genToken.js"); //passed id(mongodb id) , role , email
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  const { email, password, role } = req.body; //Note : ensure that form fields name are following through

  try {
     if (!email || !password || !role) {
      return res.status(400).render("login", {
        error: "All fields are required!",
      });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {

      // return res.status(400).json({
      //   message:
      //     "User not found with these credentials!(existing user not found)",
      // });

      return res.status(400).render("login" , {
        error : "User not found!",
      });
    }

    if (existingUser.role !== role) {
      // return res.status(400).json({
      //   message:
      //     "User does not have access to this role!(existing user didnt have req role)",
      // });

      return res.status(400).render("login" , {
        error : "ACCESS DENIED!",
      });
    }

    const correctUser = await existingUser.comparePasswords(password); //boolean return

    if (!correctUser) {
      // return res.status(400).json({
      //   message:
      //     "Sorry invalid credentials entered!(wrong passw for correctUser)",
      // });

      return res.status(400).render("login" , {
        error : "INVALID CREDENTIALS!",
      });
    }

    await User.findByIdAndUpdate(existingUser._id, { isActive: true });

    const cookieToken = generateToken(
      existingUser.email,
      existingUser.role,
      existingUser._id
    );

    res.cookie("Token", cookieToken, {
      httpOnly: true,
      //   secure: true, prod only
    });

    if (existingUser.role === "Admin") {
      return res.redirect("/user/admin-Dashboard"); // Note : rem to follow naming conv during endpoint setting
    } else if (existingUser.role === "Teacher") {
      return res.redirect("/user/teacher-Dashboard"); //Note
    } else {
      return res.redirect("/user/student-Dashboard"); //Note
    }
  } catch (error) {
    res.status(500).json({
      message: "Some err occurred while server processing!",
    });

  }
};

//auth & ver middleware for endpoints - rbac enforced
const isLoggedIn = (role) => {
  return async (req, res, next) => {
    try {
      const cookieToken = req.cookies.Token;

      if (!cookieToken) {

        return res.redirect("/");
      }

      const cookieValue = jwt.verify(cookieToken, process.env.JWT_SECRET_KEY);

      const user = await User.findOne({
        email: cookieValue.email,
        _id: cookieValue.id,
      });

      if (!user) {
        return res.redirect("/");
      }

      //rbac ensured
      if (role && role.toLowerCase() !== user.role.toLowerCase()) {
        console.log(
          `Access denied for ${user.role} trying to access ${role} route`
        );
        return res.redirect("/");
      }

      req.user = user;

      next();
    } catch (error) {
      console.error("Some err occured while processing : ", error.message);
      return res.redirect("/");
    }
  };
};

const signUpUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).render("login", {
        error: "All fields are necessary!",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).render("login", {
        error: "You already have an account!",
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      isActive: true
    });

    const cookieToken = generateToken(newUser.email, newUser.role, newUser._id);

    res.cookie("Token", cookieToken, { httpOnly: true });

    if (newUser.role === "Admin") {
      return res.redirect("/user/admin-Dashboard");
    } else if (newUser.role === "Teacher") {
      return res.redirect("/user/teacher-Dashboard");
    } else {
      return res.redirect("/user/student-Dashboard");
    }
  } catch (error) {
    console.error("Error in signUpUser:", error);
    res
      .status(500)
      .json({ message: "Some err occurred while server processing!" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const cookieToken = req.cookies.Token;

    if (!cookieToken) {
      return res.redirect("/");
    }

    const cookieValue = jwt.verify(cookieToken, process.env.JWT_SECRET_KEY);

    await User.findByIdAndUpdate(cookieValue.id, { isActive: false });

    res.cookie("Token", "", {
      httpOnly: true,
      expires: new Date(0),//expiration is imp
    });

    return res.redirect("/");
  } catch (error) {
    console.error("Error during logout:", error.message);
    return res.redirect("/");
  }
};


module.exports = { loginUser, isLoggedIn, signUpUser , logoutUser };
