//Note : for findOne make it less strict and about profile pic

const User = require("../models/user-model.js");
const generateToken = require("../utils/genToken.js"); //passed id(mongodb id) , role , email
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  const { email, password, role } = req.body; //Note : ensure that form fields name are following through
  try {
    // const existingUser = await User.findOne({ email, role });
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      // return res.redirect("/");
      return res.status(400).json({
        message : "User not found with these credentials!",
      })
    }

    if(existingUser.role !== role){
      return res.status(400).json({
        message : "User does not have access to this role!",
      })
    }

    const correctUser = await existingUser.comparePasswords(password); //boolean return

    if (!correctUser) {
      return res.status(400).json({
        message: "Sorry invalid credentials entered!",
      });
    }

    console.log(existingUser.email , existingUser.role , existingUser.password ); //debugging

    const cookieToken = generateToken({
      email: existingUser.email,
      role: existingUser.role,
      id: existingUser._id,
    });

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

const signUpUser = async (req, res) => {
  const { name , email, password, role } = req.body; //Note : ensure that form fields name are following through - rest of the fields pic 

  console.log("role : " , role);//debugging

  try {

    if(!name || !email || !password || !role){
        return res.status(400).render('login',{
            error : "All feilds are necessary!",
        })
    }

    // const existingUser = await User.findOne({ name , email, role });
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).render('login' , {
        error : "You already have an account!",
      });
    }

    const newUser = await User.create({
        name : name,
        email : email,
        password : password,
        role : role,
        // pic Note : pic is left 
    });

    const cookieToken = generateToken({
      email: newUser.email,
      role: newUser.role,
      id: newUser._id,
    });

    res.cookie("Token", cookieToken, {
      httpOnly: true,
      //   secure: true, prod only
    });

    if (newUser.role === "Admin") {
      return res.redirect("/user/admin-Dashboard"); // Note : rem to follow naming conv during endpoint setting
    } else if (newUser.role === "Teacher") {
      return res.redirect("/user/teacher-Dashboard"); //Note
    } else {
      return res.redirect("/user/student-Dashboard"); //Note
    }
  } catch (error) {
    console.error("Error : " , error.message);
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

      //rbac control
      // if (role && role.toLowerCase() !== user.role.toLowerCase()) {
      //   return res.redirect("/");
      // }

      req.user = user;

      next();
    } catch (error) {
      console.error("Some err occured while processing : ", error.message);
      return res.redirect("/");
    }
  };
};

module.exports = { loginUser, isLoggedIn , signUpUser };
