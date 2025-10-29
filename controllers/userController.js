//Note : for findOne make it less strict and about profile pic

const User = require("../models/user-model.js");
const generateToken = require("../utils/genToken.js"); //passed id(mongodb id) , role , email
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  const { email, password, role } = req.body; //Note : ensure that form fields name are following through

  console.log(email, password, role); //debugging

  try {
    // const existingUser = await User.findOne({ email, role });
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      // return res.redirect("/");
      return res.status(400).json({
        message:
          "User not found with these credentials!(existing user not found)",
      });
    }

    if (existingUser.role !== role) {
      return res.status(400).json({
        message:
          "User does not have access to this role!(existing user didnt have req role)",
      });
    }

    const correctUser = await existingUser.comparePasswords(password); //boolean return

    console.log("pass comparison of correct user with db", correctUser); //debugging

    if (!correctUser) {
      return res.status(400).json({
        message:
          "Sorry invalid credentials entered!(wrong passw for correctUser)",
      });
    }

    await User.findByIdAndUpdate(existingUser._id, { isActive: true });
console.log("User marked active on login:", existingUser.email);


    console.log(
      "Fetched creds of existing user from db : ",
      existingUser.email,
      existingUser.role,
      existingUser.password,
      existingUser.isActive
    ); //debugging

    //imp token debug

    // const cookieToken = generateToken({
    //   email: existingUser.email,
    //   role: existingUser.role,
    //   id: existingUser._id,
    // });

    const cookieToken = generateToken(
      existingUser.email,
      existingUser.role,
      existingUser._id
    );

    console.log("cookie login : ", cookieToken); //debugging

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

// const signUpUser = async (req, res) => {
//   const { name , email, password, role } = req.body; //Note : ensure that form fields name are following through - rest of the fields pic

//   console.log("req body for sign up coming with creds :  " , name , email , password , role);//debugging

//   try {

//     if(!name || !email || !password || !role){
//       return res.status(400).render('login',{
//         error : "All feilds are necessary!(some form feilds were missing)",
//       })
//     }

//     // const existingUser = await User.findOne({ name , email, role });
//     const existingUser = await User.findOne({ email });

//     console.log("existing user sign up creds from db :  " , existingUser.name , existingUser.email , existingUser.password , existingUser.role);//debugging

//     if (existingUser) {
//       return res.status(400).render('login' , {
//         error : "You already have an account!(sign up logic same person signed up)",
//       });
//     }

//     const newUser = await User.create({
//       name : name,
//       email : email,
//       password : password,
//       role : role,
//       // pic Note : pic is left
//     });

//     console.log("new user creds :  " , newUser.name , newUser.email , newUser.password , newUser.role);//debugging

//     const cookieToken = generateToken({
//       email: newUser.email,
//       role: newUser.role,
//       id: newUser._id,
//     });

//     res.cookie("Token", cookieToken, {
//       httpOnly: true,
//       //   secure: true, prod only
//     });

//     console.log("cookie sign up : " , cookieToken); //debugging

//     if (newUser.role === "Admin") {
//       return res.redirect("/user/admin-Dashboard"); // Note : rem to follow naming conv during endpoint setting
//     } else if (newUser.role === "Teacher") {
//       return res.redirect("/user/teacher-Dashboard"); //Note
//     } else {
//       return res.redirect("/user/student-Dashboard"); //Note
//     }
//   } catch (error) {
//     console.error("Error : " , error.message);
//     res.status(500).json({
//       message: "Some err occurred while server processing!",
//     });
//   }
// };

//auth & ver middleware for endpoints - rbac enforced
const isLoggedIn = (role) => {
  return async (req, res, next) => {
    try {
      const cookieToken = req.cookies.Token;

      console.log("cookie coming from browser(in req body) : ", cookieToken); //debugging

      if (!cookieToken) {
        console.log(
          "no cookie so redirected mean not logged in : ",
          cookieToken
        ); //debugging

        return res.redirect("/");
      }

      const cookieValue = jwt.verify(cookieToken, process.env.JWT_SECRET_KEY);

      console.log("cookie verification : ", cookieToken); //debugging

      const user = await User.findOne({
        email: cookieValue.email,
        _id: cookieValue.id,
      });

      console.log(
        "fetching user based on cookie details : ",
        user.name,
        user.email,
        user.password,
        user.role
      ); //debugging

      if (!user) {
        console.log(
          "no user found in db based on cookie details hence redirection!"
        ); //debugging
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
  console.log(
    "req body for sign up coming with creds:",
    name,
    email,
    password,
    role
  );

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).render("login", {
        error: "All fields are necessary! (some form fields were missing)",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("existing user found:", existingUser.email);
      return res.status(400).render("login", {
        error: "You already have an account!",
      });
    }

    console.log("No existing user found, creating new...");

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      isActive: true
    });

    console.log("New user created:", newUser.email, newUser.role);

    // const cookieToken = generateToken({
    //   email: newUser.email,
    //   role: newUser.role,
    //   id: newUser._id,
    // });

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

    console.log("User logged out and cookie destroyed:", cookieValue.email); //deugging

    return res.redirect("/");
  } catch (error) {
    console.error("Error during logout:", error.message);
    return res.redirect("/");
  }
};


module.exports = { loginUser, isLoggedIn, signUpUser , logoutUser };
