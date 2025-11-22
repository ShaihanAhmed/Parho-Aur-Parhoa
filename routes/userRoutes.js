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

const fs = require('fs');
const path = require('path');

//login pg form - 2
router.post("/login", loginUser); // /user/login

router.post("/signUp", signUpUser);

router.get("/student-Dashboard", isLoggedIn("Student"), (req, res) => {
  res.render("studentDashboard", { user: req.user });
});

//                       -------------------------------for teacher endpoints -------------------------------

// router.get("/teacher-Dashboard", isLoggedIn("Teacher"), (req, res) => {
//   //
//   res.render("teacherDashboard", { user: req.user }); //we need to send course data
// });

router.get("/teacher-Dashboard", isLoggedIn("Teacher"), async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user._id }).populate("resources");

    res.render("teacherDashboard", {
      user: req.user,
      courses,
      message: ""  // default empty
    });

  } catch (err) {
    console.error(err);
    res.render("teacherDashboard", {
      user: req.user,
      courses: [],
      message: `Error: ${err.message}`
    });
  }
});


//                       -------------------------------for admin endpoints -------------------------------

//move back point incase route fails (fail safe)

// router.get("/admin-Dashboard" , isLoggedIn("Admin") , (req , res) => {
//     res.render("adminDashboard" , {user : req.user});
//  });

function getLogs() {
  try {
    const data = fs.readFileSync(logFilePath, 'utf-8');
    const lines = data.split('\n').filter(line => line.trim() !== '');

    // Parse each line into an object with time and username
    const logs = lines.map(line => {
      // Example line: [2025-11-19T15:03:04.943Z] Admin DELETED user: test3 (#6904aaab48eb9946f1956782)
      const timeMatch = line.match(/\[(.*?)\]/); // gets timestamp
      const userMatch = line.match(/user: (\w+)/); // gets username (assuming simple usernames)
      return {
        time: timeMatch ? timeMatch[1] : 'Unknown',
        username: userMatch ? userMatch[1] : 'Unknown',
        raw: line // keep full line just in case
      };
    });

    return logs;
  } catch (err) {
    console.error('Failed to read log file:', err);
    return [];
  }
}

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

  const logs = getLogs();

  res.render("adminDashboard", {
    admin: req.user,
    users: allUsers,
    courses: allCourses,
    userCount: currUsers || 334,
    activeUsers: activeUsers || 200,
    courseCount: currCourses || 20,
    logs: logs,
  });
});

const logFilePath = path.join(__dirname, '..', 'log.txt');

function logAction(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    console.log(id);

    // Delete the user from MongoDB
    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Log action
    logAction(`Admin DELETED user: ${user.name} (#${id})`);

    res.json({ message: "User deleted", deletedUser: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/logout", isLoggedIn(), logoutUser);

module.exports = router;

