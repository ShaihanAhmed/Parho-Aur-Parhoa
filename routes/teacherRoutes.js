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
const Quiz = require("../models/quiz-model.js");

const fs = require('fs');
const path = require('path');

//-------------------------------------------

const upload = require("../middlewares/upload.js");

const {
  createCourse,
  addResource,
  createCourseWithResources,
} = require("../controllers/teacherController.js");

// Create course

// router.post("/course/create" , createCourse); //added /course to endpoint ready for testing --- removed this , isLoggedIn("Teacher")

// // Upload file or video to Cloudinary & attach to course
// router.post(
//   "/:courseId/resource",
//   upload.single("file"),  // important!
//   addResource
// );

//----------------------------------------------------------
router.post(
  "/course/create-with-resources",
  isLoggedIn("Teacher"),   // <--- ensures req.user exists
  upload.array("files", 10),
  createCourseWithResources
);


module.exports = router;


