//add in docs :
//todos schema defined with each att and its expected datatype with proper refrencing to diff models
//catering speration of concers

const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    //shared att
    title: { type: String, required: true },

    desc: { type: String },

    createdBy : {type : mongoose.Schema.Types.ObjectId , required : true},

    isCompleted : {type : Boolean , default : false}
},

  {
    timestamps: true, //created / upd handled
  }
);

//default exp
module.exports = mongoose.model("Todo", todoSchema);
