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
  if (!user || !username) return response.status(400).send();

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const alreadyExists = users.some((user) => user.username == username);

  if (!name || !username || alreadyExists) {
    return response.status(400).send();
  }

  const user = { id: uuidv4(), name: name, username: username, todos: [] };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/users", (_, response) => {
  response.status(200).json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;
