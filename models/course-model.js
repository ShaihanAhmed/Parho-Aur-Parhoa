//add in docs :
//course schema defined with each att and its expected datatype with proper refrencing to diff models
//catering speration of concers

const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    //shared att
    name: { type: String, required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId , ref : "User" , required: true },
    
    announcements: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Announcement" },
    ],

    resources : [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],

    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],

},

  {
    timestamps: true, //created / upd handled
  }
);

//default exp
module.exports = mongoose.model("Course", courseSchema);
