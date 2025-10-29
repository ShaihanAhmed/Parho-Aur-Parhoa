//cookie setting kai liya
//for verfication on other endpoints - email , id , role signed on basis of secret
const jwt = require("jsonwebtoken");

const generateToken = (email , role , id) => { 
    return jwt.sign(
        {email ,  role , id},
        process.env.JWT_SECRET_KEY,
        {
            expiresIn : "1d",
        }
    )
 }

module.exports = generateToken;