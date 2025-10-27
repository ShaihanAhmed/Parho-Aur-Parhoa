require("dotenv").config();
const config = require("config");

const express = require('express');
const app = express();
const path = require("path");

const debug = require("debug")("development:server"); //setting namespace with env and coing file name


//db config
const connDB = require("./config/mongooseConnection");
connDB();

const port = process.env.PORT || 3000;

const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render("login");
});

app.get('/login', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  debug(`${config.get("APP NAME")} Server running successfully 🚀 on port : ${port}!`)
})