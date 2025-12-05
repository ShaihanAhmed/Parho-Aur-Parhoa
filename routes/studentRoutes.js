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
const Todo = require("../models/todo-model.js");

const todoController = require("../controllers/todosController.js");


const fs = require('fs');
const path = require('path');

// --------------------------------------------------------------
// ------------------------Start a Course----------------------
router.post("/enroll-course/:courseId", isLoggedIn("Student") , async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    const user = await User.findById(userId);

    // If already enrolled → do NOT add again
    if (user.courses.includes(courseId)) {
      return res.redirect("/user/student-Dashboard"); // quietly redirect (no errors on UI)
    }

    // Add course to user's courses array
    user.courses.push(courseId);
    await user.save();

    res.redirect("/user/student-Dashboard");

  } catch (err) {
    console.error("Error enrolling course:", err);
    return res.status(500).send("Internal Server Error");
  }
});

// ========================= Student: View enrolled course ======================
// studentRoutes.js
router.get("/course/:courseId", isLoggedIn("Student"), async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Fetch course and populate announcements, resources, quizzes
    const course = await Course.findById(courseId)
      .populate("announcements")
      .populate("resources")
      .populate("quizzes");

    if (!course) {
      return res.redirect("/user/student-Dashboard?error=Course+not+found");
    }

    // Render course view page
    res.render("courseView", {
      course,
      student: req.user
    });
  } catch (err) {
    console.error("Error loading course:", err);
    return res.redirect("/user/student-Dashboard?error=Something+went+wrong");
  }
});

// --------------------------------------------------------------
// ------------------------attemp quiz----------------------


router.get("/quiz/:quizId", isLoggedIn("Student"), async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findById(quizId); // include questions and options

    if (!quiz) {
      return res.redirect("/quiz/student-Dashboard?error=Quiz+not+found");
    }

    res.render("takeQuiz", { quiz, student: req.user });
  } catch (err) {
    console.error(err);
    return res.redirect("/quiz/student-Dashboard?error=Cannot+load+quiz");
  }
});

// -------------------------------------------------------
// ------------------------------------------------------- subit quiz

// router.post("/quiz/:quizId", isLoggedIn("Student"), async (req, res) => {
//   try {
//     const quizId = req.params.quizId;
//     const student = req.user; // logged-in user
//     const answers = req.body; // { questionId: selectedOption }

//     // Fetch quiz
//     const quiz = await Quiz.findById(quizId);
//     if (!quiz) {
//       return res.redirect("/user/student-Dashboard?error=Quiz+not+found");
//     }

//     // Calculate score
//     let score = 0;
//     quiz.questions.forEach(q => {
//       if (answers[q._id] == q.answer) score++;
//     });

//     // Prepare filename and file content
//     const sanitizedStudentName = student.name.replace(/\s+/g, "_"); // replace spaces with underscores
//     const sanitizedQuizTitle = quiz.title.replace(/\s+/g, "_");
//     const fileName = `${sanitizedStudentName}-${sanitizedQuizTitle}.txt`;
//     const filePath = path.join(__dirname, "../quizScores", fileName);

//     const fileContent = `Student: ${student.name}
// Quiz: ${quiz.title}
// Score: ${score} / ${quiz.questions.length}
// Date: ${new Date().toLocaleString()}
// `;

//     // Ensure folder exists
//     const dirPath = path.join(__dirname, "../quizScores");
//     if (!fs.existsSync(dirPath)) {
//       fs.mkdirSync(dirPath);
//     }

//     // Write the score to the file
//     fs.writeFileSync(filePath, fileContent);

//     // Redirect back to course page with success message
//     res.redirect(`/student/course/${quiz.course}?success=Quiz+submitted,+score:+${score}`);

//   } catch (err) {
//     console.error("Error submitting quiz:", err);
//     return res.redirect("/user/student-Dashboard?error=Cannot+submit+quiz");
//   }
// });

// -------------------------------------------------------------- now for score cal - best working route
// router.post("/quiz/:quizId", isLoggedIn("Student"), async (req, res) => {
//   try {
//     const quizId = req.params.quizId;
//     const student = req.user;
//     const answers = req.body || {}; // { "<questionId>": "<selectedOptionText>" }

//     const quiz = await Quiz.findById(quizId);
//     if (!quiz) {
//       return res.redirect("/user/student-Dashboard?error=Quiz+not+found");
//     }

//     let score = 0;

//     quiz.questions.forEach(q => {
//       const qid = q._id.toString();
//       const submitted = answers[qid];     // text from radio button
//       const correct = q.answer;           // stored text from teacher

//       console.log({ qid, submitted, correct });

//       if (submitted && submitted.trim() === correct.trim()) {
//         score++;
//       }
//     });

//     // Save score in file
//     const sanitizedStudentName = student.name.replace(/\s+/g, "_");
//     const sanitizedQuizTitle = quiz.title.replace(/\s+/g, "_");
//     const dirPath = path.join(__dirname, "../quizScores");
//     const filePath = path.join(dirPath, `${sanitizedStudentName}-${sanitizedQuizTitle}.txt`);

//     if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

//     fs.writeFileSync(
//       filePath,
// `Student: ${student.name}
// Quiz: ${quiz.title}
// Score: ${score} / ${quiz.questions.length}
// Date: ${new Date().toLocaleString()}
// `
//     );

//     return res.redirect(`/user/student-Dashboard?success=Quiz+submitted,+score:+${score}`);

//   } catch (err) {
//     console.error("Error submitting quiz:", err);
//     return res.redirect("/user/student-Dashboard?error=Cannot+submit+quiz");
//   }
// });

// -------------------------------------------------------------- adding attemted quizzes to db obj of student
router.post("/quiz/:quizId", isLoggedIn("Student"), async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const student = req.user;
    const answers = req.body || {}; // { "<questionId>": "<selectedOptionText>" }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.redirect("/user/student-Dashboard?error=Quiz+not+found");
    }

    let score = 0;

    quiz.questions.forEach(q => {
      const qid = q._id.toString();
      const submitted = answers[qid];     // student selected text
      const correct = q.answer;           // stored text

      // console.log({ qid, submitted, correct });

      if (submitted && submitted.trim() === correct.trim()) {
        score++;
      }
    });

    const sanitizedStudentName = student.name.replace(/\s+/g, "_");
    const sanitizedQuizTitle = quiz.title.replace(/\s+/g, "_");
    const dirPath = path.join(__dirname, "../quizScores");
    const filePath = path.join(dirPath, `${sanitizedStudentName}-${sanitizedQuizTitle}.txt`);

    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

    fs.writeFileSync(
      filePath,
`Student: ${student.name}
Quiz: ${quiz.title}
Score: ${score} / ${quiz.questions.length}
Date: ${new Date().toLocaleString()}
`
    );

    if (!student.quizzes.includes(quizId)) {
      student.quizzes.push(quizId);
      await student.save();
    }

    return res.redirect(`/user/student-Dashboard?success=Quiz+submitted,+score:+${score}`);

  } catch (err) {
    console.error("Error submitting quiz:", err);
    return res.redirect("/user/student-Dashboard?error=Cannot+submit+quiz");
  }
});

// -------------------------------------------------------------- quizzes attempted count
// -------------------------------------------------------------- quizzes attempted count

router.get("/attempted-quizzes-count", isLoggedIn("Student") , async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select("quizzes");
    
    if (!user) {
      return res.status(404).send("User not found");
    }
    
    const count = user.quizzes.length;
    
    res.status(200).json({
      attemptedQuizzes: count,
    });
    
  } catch (err) {
    console.error("Error fetching attempted quizzes:", err);
    return res.status(500).send("Internal Server Error");
  }
});

// -------------------------------------------------------------- enrolled courses count
// -------------------------------------------------------------- enrolled courses count

router.get("/enrolled-courses-count", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const student = await User.findById(userId).select("courses");
    
    if (!student) {
      return res.status(404).send("Student not found");
    }
    
    res.status(200).json({
      enrolledCoursesCount: student.courses.length,
    });
    
  } catch (err) {
    console.error("Error fetching enrolled course count:", err);
    res.status(500).send("Internal Server Error");
  }
});

// -------------------------------------------------------------- total available courses count
// -------------------------------------------------------------- total available courses count

router.get("/courses/count", isLoggedIn, async (req, res) => {
  try {
    const count = await Course.countDocuments();

    res.status(200).json({
      totalCoursesCount: count,
    });

  } catch (err) {
    console.error("Error fetching courses count:", err);
    res.status(500).send("Internal Server Error");
  }
});

// --------------------------------------------------------------
// ------------------------view todo endpoints----------------------

router.post("/add-todo", isLoggedIn("Student") , todoController.addTodo);

// Delete a todo
router.get("/delete-todo/:id", isLoggedIn("Student") , todoController.deleteTodo);

// Toggle completion
router.get("/toggle-todo/:id", isLoggedIn("Student"), async (req, res) => {
  try {
    const todoId = req.params.id;

    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.redirect("/user/student-Dashboard?error=Todo+not+found");
    }

    // Ensure only creator can toggle
    if (todo.createdBy.toString() !== req.user._id.toString()) {
      return res.redirect("/user/student-Dashboard?error=Unauthorized+action");
    }

    // Toggle completion
    todo.isCompleted = !todo.isCompleted;
    await todo.save();

    return res.redirect("/user/student-Dashboard");
  } catch (err) {
    console.error("Error toggling todo:", err);
    return res.redirect("/user/student-Dashboard?error=Something+went+wrong");
  }
});




module.exports = router;