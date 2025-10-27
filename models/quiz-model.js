//add in docs :
//quiz schema defined with each att and its expected datatype with proper refrencing to diff models
//catering speration of concers

const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
    question : {type : String , required : true},
    options : [{type : String , required : true}],
    answer : {type : String , required : true}
})

const quizSchema = new mongoose.Schema(
  {
    //shared att
    title: { type: String, required: true },

    topic: { type: String },

    questions : [questionSchema]
},

  {
    timestamps: true, //created / upd handled
  }
);

//default exp
module.exports = mongoose.model("Quiz", quizSchema);
