// const fs = require("fs");
// const path = require("path");

// const filePath = path.join(__dirname, "../data/todos.json");

// // READ
// function readTodos() {
//   if (!fs.existsSync(filePath)) return {};
//   let data = fs.readFileSync(filePath, "utf8");
//   return JSON.parse(data || "{}");
// }

// // WRITE
// function writeTodos(data) {
//   fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
// }

// // ADD TODO
// exports.addTodo = (req, res) => {
//   const userId = req.session.user._id;  // logged-in student
//   const text = req.body.text;

//   let todos = readTodos();

//   if (!todos[userId]) todos[userId] = [];

//   todos[userId].push({
//     id: Date.now().toString(),
//     text: text,
//     completed: false
//   });

//   writeTodos(todos);
//   res.redirect("/student/dashboard");
// };

// // DELETE TODO
// exports.deleteTodo = (req, res) => {
//   const userId = req.session.user._id;
//   const todoId = req.params.id;

//   let todos = readTodos();

//   if (todos[userId]) {
//     todos[userId] = todos[userId].filter(t => t.id !== todoId);
//   }

//   writeTodos(todos);
//   res.redirect("/student/dashboard");
// };

// // SEND TODOS TO FRONTEND
// exports.getTodos = (userId) => {
//   let todos = readTodos();
//   return todos[userId] || [];
// };

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

const Todo = require("../models/todo-model.js");

// Add a new todo
exports.addTodo = async (req, res) => {
  try {
    const { title, desc } = req.body;

    if (!title) {
      return res.redirect("/user/student-Dashboard?error=Title+is+required");
    }

    const todo = new Todo({
      title,
      desc: desc || "",
      createdBy: req.user._id
    });

    await todo.save();

    return res.redirect("/user/student-Dashboard?success=Todo+added+successfully");
  } catch (err) {
    console.error("Error adding todo:", err);
    return res.redirect("/user/student-Dashboard?error=Something+went+wrong");
  }
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
  try {
    const todoId = req.params.id;

    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.redirect("/user/student-Dashboard?error=Todo+not+found");
    }

    // Optional: ensure only the creator can delete
    if (todo.createdBy.toString() !== req.user._id.toString()) {
      return res.redirect("/user/student-Dashboard?error=Unauthorized+action");
    }

    await Todo.findByIdAndDelete(todoId);

    return res.redirect("/user/student-Dashboard?success=Todo+deleted+successfully");
  } catch (err) {
    console.error("Error deleting todo:", err);
    return res.redirect("/user/student-Dashboard?error=Something+went+wrong");
  }
};
