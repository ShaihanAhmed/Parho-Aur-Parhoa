const mongoose = require("mongoose");
const debug = require("debug")("development:mongooseConfig"); //setting namespace with env and coing file name

const connectDB = async ()=> {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ParhoAurParhoa";

        await mongoose.connect(MONGODB_URI);

        debug("connected to DB!");
    } catch (error) {
        debug("Some error occured while connecting to DB : ",error.message);
        process.exit(1);
    }
}

module.exports = connectDB ;