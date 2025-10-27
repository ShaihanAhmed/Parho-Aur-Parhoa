//add in docs :
//user schema defined with each att and its expected datatype with proper refrencing to diff models
//catering speration of concers
//ensuring no pass is saved with proper enc with hashing and salting
//methods available :
//              1) comp passw for login
//              2)endpoint rbac control
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    //shared att
    Name: { type: String, required: true },

    Email: { type: String, required: true, unique: true },

    Password: { type: String, required: true },

    Role: {
      type: String,
      enum: ["Admin", "Teacher", "Student"],
      default: "Student",
    },

    // pic

    IsActive: { type: Boolean, default: false }, //logout pai we set to false | sign/log true

    //for teacher and student

    Courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

    Quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],

    Todos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Todo" }],
  },

  {
    timestamps: true, //created / upd handled
  }
);

//imp func
//middleware
userSchema.pre("save", async function (next) {
  //arrow dont have access to this
  if (!this.isModified("Password")) {
    return next();
  } else {
    try {
      this.Password = await bcrypt.hash(this.Password, 10);
      next();
    } catch (error) {
      console.error("Some err occured while hashing!", error.message);
    }
  }
});

//funcs
userSchema.methods.comparePasswords = async function (pass) {
  if (!pass) {
    throw new Error("Some err occured while req management of password!");
  }

  return await bcrypt.compare(pass, this.Password);
};

//default exp
module.exports = mongoose.model("User", userSchema);
