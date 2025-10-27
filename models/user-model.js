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
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["Admin", "Teacher", "Student"],
      default: "Student",
    },

    // pic

    isActive: { type: Boolean, default: false }, //logout pai we set to false | sign/log true

    //for teacher and student

    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],

    todos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Todo" }],
  },

  {
    timestamps: true, //created / upd handled
  }
);

//imp func
//middleware
userSchema.pre("save", async function (next) {
  //arrow dont have access to this
  if (!this.isModified("password")) {
    return next();
  } else {
    try {
      this.password = await bcrypt.hash(this.password, 10);
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

  return await bcrypt.compare(pass, this.password);
};

//default exp
module.exports = mongoose.model("User", userSchema);
