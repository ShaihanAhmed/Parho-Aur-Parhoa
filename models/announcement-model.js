//add in docs :
//announcements schema defined with each att and its expected datatype with proper refrencing to diff models
//catering speration of concers

const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    //shared att
    message: { type: String, required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId , ref : "User" , required : true },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
},

  {
    timestamps: true, //created / upd handled
  }
);

//default exp
module.exports = mongoose.model("Announcement", announcementSchema);
