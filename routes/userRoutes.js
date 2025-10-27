const express = require("express"); //3
const {loginUser , isLoggedIn , signUpUser} = require("../controllers/userController.js");

const router = express.Router();

//login pg form - 2
router.post('/login', loginUser); // /user/login

router.post('/signUp', signUpUser);

router.get("/student-Dashboard" , isLoggedIn("Student") , (req , res) => { 
    res.render("studentDashboard");
 });

router.get("/teacher-Dashboard" , isLoggedIn("Teacher") , (req , res) => { 
    res.render("teacherDashboard");
 });

module.exports = router;