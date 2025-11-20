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

