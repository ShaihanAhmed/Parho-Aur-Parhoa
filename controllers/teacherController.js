// const Course = require("../models/Course");
// const Resource = require("../models/Resource");

// const Resource = require("../models/resource-model.js");
// const Course = require("../models/course-model.js");

//------------------------------------------------------------------------
// exports.createCourseWithResources = async (req, res) => {
//   try {
//     const { name } = req.body;

//     if (!name) return res.status(400).json({ message: "Course name is required" });

//     const existingCourse = await Course.findOne({
//         name,
//         createdBy: req.user._id
//     });

//     if (existingCourse) {
//         return res.status(400).json({
//             message: `You already have a course named "${name}"`
//         });
//     }

//     const teacherId = req.user._id; // <--- using logged-in teacher ID

//     const course = await Course.create({
//       name,
//       createdBy: teacherId,
//     });

//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const resource = await Resource.create({
//           title: file.originalname,
//           fileUrl: file.path,    // Cloudinary URL
//           fileType: file.mimetype,
//           uploadedBy: teacherId,
//         });

//         await Course.findByIdAndUpdate(course._id, {
//           $push: { resources: resource._id },
//         });
//       }
//     }

//     res.status(201).json({
//       message: "Course + Resources created successfully",
//       course,
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

//------------------------------- fallback point real shit v imp ----------------------------
// exports.createCourseWithResources = async (req, res) => {
//   try {
//     const { name } = req.body;

//     if (!name) {
//       return res.render("course-upload-test", {
//         user: req.user,
//         message: "Course name is required",
//         courses: await Course.find({ createdBy: req.user._id }).populate("resources")
//       });
//     }

//     // check if teacher already has a course with this name
//     const existingCourse = await Course.findOne({
//         name,
//         createdBy: req.user._id
//     });

//     if (existingCourse) {
//       return res.render("course-upload-test", {
//         user: req.user,
//         message: `You already have a course named "${name}"`,
//         courses: await Course.find({ createdBy: req.user._id }).populate("resources")
//       });
//     }

//     const teacherId = req.user._id;

//     const course = await Course.create({
//       name,
//       createdBy: teacherId,
//     });

//     // handle uploaded files
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const resource = await Resource.create({
//           title: file.originalname,
//           fileUrl: file.path,
//           fileType: file.mimetype,
//           uploadedBy: teacherId,
//         });

//         await Course.findByIdAndUpdate(course._id, {
//           $push: { resources: resource._id },
//         });
//       }
//     }

//     // fetch updated courses to show
//     const courses = await Course.find({ createdBy: teacherId }).populate("resources");

//     res.render("teacherDashboard", {
//       user: req.user,
//       message: `Course "${name}" created successfully!`,
//       courses
//     });

//   } catch (err) {
//     console.error(err);
//     res.render("teacherDashboard", {
//       user: req.user,
//       message: `Error: ${err.message}`,
//       courses: await Course.find({ createdBy: req.user._id }).populate("resources")
//     });
//   }
// };

//-------------------------------------------------------------- fallback resource - quiz -----------------------------

// const Quiz = require("../models/quiz-model.js");

// exports.createCourseWithResources = async (req, res) => {
//   try {
//     const { name, quizTitle, quizTopic } = req.body;
//     const teacherId = req.user._id;

//     // Gather 5 quiz questions from the form
//     let questions = [];
//     for (let i = 1; i <= 5; i++) {
//       const q = req.body[`q${i}`];
//       const opts = req.body[`q${i}_options`]; // array of 4 options
//       const ans = req.body[`q${i}_answer`];   // correct answer
//       if (q && opts && ans) {
//         questions.push({ question: q, options: opts, answer: ans });
//       }
//     }

//     // Validation: course name required
//     if (!name) {
//       return res.render("teacherDashboard", {
//         user: req.user,
//         message: "Course name is required",
//         courses: await Course.find({ createdBy: teacherId }).populate("resources quizzes")
//       });
//     }

//     // Check if course already exists
//     const existingCourse = await Course.findOne({ name, createdBy: teacherId });
//     if (existingCourse) {
//       return res.render("teacherDashboard", {
//         user: req.user,
//         message: `You already have a course named "${name}"`,
//         courses: await Course.find({ createdBy: teacherId }).populate("resources quizzes")
//       });
//     }

//     // Create course
//     const course = await Course.create({ name, createdBy: teacherId });

//     // Upload resources
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const resource = await Resource.create({
//           title: file.originalname,
//           fileUrl: file.path,
//           fileType: file.mimetype,
//           uploadedBy: teacherId,
//         });
//         await Course.findByIdAndUpdate(course._id, { $push: { resources: resource._id } });
//       }
//     }

//     // Create quiz (only if title provided and exactly 5 questions)
//     if (quizTitle && questions.length === 5) {
//       const quiz = await Quiz.create({ title: quizTitle, topic: quizTopic || "", questions });
//       await Course.findByIdAndUpdate(course._id, { $push: { quizzes: quiz._id } });
//     }

//     // Fetch updated courses
//     const courses = await Course.find({ createdBy: teacherId }).populate("resources quizzes");

//     res.render("teacherDashboard", {
//       user: req.user,
//       message: `Course "${name}" created successfully!`,
//       courses
//     });

//   } catch (err) {
//     console.error(err);
//     res.render("teacherDashboard", {
//       user: req.user,
//       message: `Error: ${err.message}`,
//       courses: await Course.find({ createdBy: req.user._id }).populate("resources quizzes")
//     });
//   }
// };


// ----------------------------------------------- quiz - announce -----------------------

const Announcement = require("../models/announcement-model.js");
const Course = require("../models/course-model.js");
const Quiz = require("../models/quiz-model.js");
const Resource = require("../models/resource-model.js");


exports.createCourseWithResources = async (req, res) => {
  try {
    const { name, quizTitle, quizTopic, announcementMessage } = req.body;
    const teacherId = req.user._id;

    // Gather 5 quiz questions from the form
    let questions = [];
    for (let i = 1; i <= 5; i++) {
      const q = req.body[`q${i}`];
      const opts = req.body[`q${i}_options`]; // array of 4 options
      const ans = req.body[`q${i}_answer`];   // correct answer
      if (q && opts && ans) {
        questions.push({ question: q, options: opts, answer: ans });
      }
    }

    // Validation: course name required
    if (!name) {
      return res.render("teacherDashboard", {
        user: req.user,
        message: "Course name is required",
        courses: await Course.find({ createdBy: teacherId }).populate("resources quizzes announcements")
      });
    }

    // Prevent duplicate course name
    const existingCourse = await Course.findOne({ name, createdBy: teacherId });
    if (existingCourse) {
      return res.render("teacherDashboard", {
        user: req.user,
        message: `You already have a course named "${name}"`,
        courses: await Course.find({ createdBy: teacherId }).populate("resources quizzes announcements")
      });
    }

    // Create the course
    const course = await Course.create({ name, createdBy: teacherId });

    // Upload resources
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const resource = await Resource.create({
          title: file.originalname,
          fileUrl: file.path,
          // fileUrl: file.secure_url, //for downloading
          fileType: file.mimetype,
          uploadedBy: teacherId,
        });
        await Course.findByIdAndUpdate(course._id, { $push: { resources: resource._id } });
      }
    }

    // Create quiz (only if title provided and exactly 5 questions)
    if (quizTitle && questions.length === 5) {
      const quiz = await Quiz.create({
        title: quizTitle,
        topic: quizTopic || "",
        questions
      });

      await Course.findByIdAndUpdate(course._id, { $push: { quizzes: quiz._id } });
    }

    // Create announcement (ONLY if teacher wrote message)
    if (announcementMessage && announcementMessage.trim() !== "") {
      const announcement = await Announcement.create({
        message: announcementMessage,
        createdBy: teacherId,
        course: course._id
      });

      await Course.findByIdAndUpdate(course._id, {
        $push: { announcements: announcement._id }
      });
    }

    // Fetch updated courses list
    const courses = await Course.find({ createdBy: teacherId })
      .populate("resources quizzes announcements");

    res.render("teacherDashboard", {
      user: req.user,
      message: `Course "${name}" created successfully!`,
      courses
    });

  } catch (err) {
    console.error(err);
    res.render("teacherDashboard", {
      user: req.user,
      message: `Error: ${err.message}`,
      courses: await Course.find({ createdBy: req.user._id }).populate("resources quizzes announcements")
    });
  }
};




