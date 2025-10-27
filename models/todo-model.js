//add in docs :
//todos schema defined with each att and its expected datatype with proper refrencing to diff models
//catering speration of concers

const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    //shared att
    Title: { type: String, required: true },

    Desc: { type: String },

    createdBy : {type : mongoose.Schema.Types.ObjectId , required : true},

    IsCompleted : {type : Boolean , default : false}
},

  {
    timestamps: true, //created / upd handled
  }
);

//default exp
module.exports = mongoose.model("Todo", todoSchema);
