const express = require("express"); //3
const {
  loginUser,
  isLoggedIn,
  signUpUser,
  logoutUser,
} = require("../controllers/userController.js");

const router = express.Router();

const User = require("../models/user-model.js");
const Course = require("../models/course-model.js");

//login pg form - 2
router.post("/login", loginUser); // /user/login

router.post("/signUp", signUpUser);

router.get("/student-Dashboard", isLoggedIn("Student"), (req, res) => {
  res.render("studentDashboard", { user: req.user });
});

router.get("/teacher-Dashboard", isLoggedIn("Teacher"), (req, res) => {
  //
  res.render("teacherDashboard", { user: req.user });
});

//move back point incase route fails (fail safe)

// router.get("/admin-Dashboard" , isLoggedIn("Admin") , (req , res) => {
//     res.render("adminDashboard" , {user : req.user});
//  });

router.get("/admin-Dashboard", isLoggedIn("Admin"), async (req, res) => {
  //for ssr

  //fetching all user's data only student and techer to avoid acc leak of admin data
  const allUsers = await User.find({
    role: { $in: ["Student", "Teacher"] },
  });

  const currUsers = await User.countDocuments({
    role: { $in: ["Student", "Teacher"] },
  });

  const activeUsers = await User.countDocuments({
    role: { $in: ["Student", "Teacher"] },
    isActive: true,
  });

  let allCourses = await Course.find({});

  if (allCourses.length === 0) {
    allCourses = [
      {
        name: "testingCourse",
        createdBy: "testingTeacher",
      },
    ];
  }

  const currCourses = await Course.countDocuments({});

  res.render("adminDashboard", {
    admin: req.user,
    users: allUsers,
    courses: allCourses,
    userCount: currUsers || 334,
    activeUsers: activeUsers || 200,
    courseCount: currCourses || 20,
  });
});



router.get("/logout", isLoggedIn(), logoutUser);

module.exports = router;
