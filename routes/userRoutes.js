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
const Todo = require("../models/todo-model");

const todoController = require("../controllers/todosController.js");

const fs = require('fs');
const path = require('path');

//login pg form - 2
router.post("/login", loginUser); // /user/login

router.post("/signUp", signUpUser);

// router.get("/student-Dashboard", isLoggedIn("Student"), (req, res) => {
//   res.render("studentDashboard", { user: req.user });
// });

// -------------------------------------------------------
// ------------------------------------------------------- all working main fallback

// router.get("/student-Dashboard", isLoggedIn("Student"), async (req, res) => {
//   try {
//     const user = req.user;

//     // Fetch all available courses
//     const allCourses = await Course.find({}, "name");

//     // Populate student's enrolled courses
//     const studentData = await User.findById(user._id)
//       .populate("courses", "name")
//       .select("courses name email");

//     // Fetch student's todos
//     const todos = await Todo.find({ createdBy: user._id }).sort({ createdAt: -1 });

//     // const totalAvailableCourses = allCourses.length;
//     // const totalEnrolledCourses = studentData.courses.length;
//     // const totalAttemptedQuizzes = studentData.quizzes.length;

//     res.render("studentDashboard", {
//       student: user,
//       courses: allCourses,
//       enrolled: studentData.courses || [],
//       todos,
//       quizzes: [],
//       announcements: [],

//       //  totalAvailableCourses : totalAvailableCourses || 22,
//       // totalEnrolledCourses : totalEnrolledCourses || 5,
//       // totalAttemptedQuizzes : totalAttemptedQuizzes || 6,
//     });

//   } catch (err) {
//     console.error("Error loading student dashboard:", err);
//     res.status(500).send("Internal Server Error");
//   }
// });

// --------------------------------------------------------

router.get("/student-Dashboard", isLoggedIn("Student"), async (req, res) => {
  try {
    const user = req.user;

    // 1) Fetch all available courses (only names)
    const allCourses = await Course.find({}, "name");

    // 2) Fetch student with enrolled courses
    const studentData = await User.findById(user._id)
      .populate("courses", "name")
      .select("courses quizzes name email");

    // 3) Fetch todos
    const todos = await Todo.find({ createdBy: user._id }).sort({ createdAt: -1 });

    // ---- COUNTS YOU WANT ----
    const totalAvailableCourses = allCourses.length;
    const totalEnrolledCourses = studentData.courses.length;
    const totalAttemptedQuizzes = studentData.quizzes.length;

    // console.log("Total Available Courses:", totalAvailableCourses);
    // console.log("Total Enrolled Courses:", totalEnrolledCourses);
    // console.log("Total Attempted Quizzes:", totalAttemptedQuizzes);

    res.render("studentDashboard", {
      student: user,
      courses: allCourses,
      enrolled: studentData.courses || [],
      todos,
      quizzes: [],
      announcements: [],

      // EXTRA COUNTS ⬇️
      totalAvailableCourses : totalAvailableCourses || 22,
      totalEnrolledCourses : totalEnrolledCourses || 5,
      totalAttemptedQuizzes : totalAttemptedQuizzes || 6,

      // ---- scoe testing
       success: req.query.success || null,
    });

  } catch (err) {
    console.error("Error loading student dashboard:", err);
    res.status(500).send("Internal Server Error");
  }
});


//                       -------------------------------for teacher endpoints -------------------------------

// router.get("/teacher-Dashboard", isLoggedIn("Teacher"), (req, res) => {
//   //
//   res.render("teacherDashboard", { user: req.user }); //we need to send course data
// });

router.get("/teacher-Dashboard", isLoggedIn("Teacher"), async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user._id }).populate("resources").populate("quizzes").populate("announcements");

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

