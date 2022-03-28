const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user || !username) return response.status(404).send();

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const alreadyExists = users.some((user) => user.username == username);

  if (!name || !username || alreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = { id: uuidv4(), name: name, username: username, todos: [] };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.user;

  if (!title || !deadline) return response.status(400).send();

  const index = users.findIndex((user) => user.username === username);
  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  users[index].todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.user;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const indexUser = users.findIndex((user) => user.username === username);
  const indexTodo = users[indexUser].todos.findIndex((todo) => todo.id === id);

  if (indexUser > -1 && indexTodo > -1) {
    users[indexUser].todos[indexTodo].title = title;
    users[indexUser].todos[indexTodo].deadline = new Date(deadline);

    return response.status(200).json(users[indexUser].todos[indexTodo]);
  }

  return response.status(404).json({ error: "Todo dont exist" });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.user;
  const { id } = request.params;

  const indexUser = users.findIndex((user) => user.username === username);
  const indexTodo = users[indexUser].todos.findIndex((todo) => todo.id === id);

  if (indexUser > -1 && indexTodo > -1) {
    users[indexUser].todos[indexTodo].done = true;

    return response.status(200).json(users[indexUser].todos[indexTodo]);
  }

  return response.status(404).json({ error: "Todo dont exist" });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.user;
  const { id } = request.params;

  const indexUser = users.findIndex((user) => user.username === username);
  const indexTodo = users[indexUser].todos.findIndex((todo) => todo.id === id);

  if (indexUser > -1 && indexTodo > -1) {
    users[indexUser].todos.splice(indexTodo);

    return response.status(204).send();
  }

  return response.status(404).json({ error: "Todo dont exist" });
});

module.exports = app;
