//add in docs :
//course schema defined with each att and its expected datatype with proper refrencing to diff models
//catering speration of concers

const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    //shared att
    Name: { type: String, required: true },

    CreatedBy: { type: mongoose.Schema.Types.ObjectId , ref : "User" , required: true },
    
    Announcements: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Announcement" },
    ],

    Resources : [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],

    Quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],

},

  {
    timestamps: true, //created / upd handled
  }
);

//default exp
module.exports = mongoose.model("Course", courseSchema);
