const express = require("express"); //3
const {loginUser , isLoggedIn , signUpUser , logoutUser} = require("../controllers/userController.js");

const router = express.Router();

//login pg form - 2
router.post('/login', loginUser); // /user/login

router.post('/signUp', signUpUser);

router.get("/student-Dashboard" , isLoggedIn("Student") , (req , res) => { 
    res.render("studentDashboard" , {user : req.user});
 });

router.get("/teacher-Dashboard" , isLoggedIn("Teacher") , (req , res) => {  // 
    res.render("teacherDashboard" , {user : req.user});
 });

router.get("/admin-Dashboard" , isLoggedIn("Admin") , (req , res) => { 
    res.render("adminDashboard" , {user : req.user});
 });


router.get('/logout' , isLoggedIn() , logoutUser);

module.exports = router;