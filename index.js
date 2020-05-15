const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const FILTER = require("bad-words");

const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
//const app = require('express')();

const server = http.createServer(app);
// const server = require('http').Server(app);

const io = socketio(server);
// const io = require('socket.io')(server);

const port = process.env.PORT || 4000;
const publicDirectoryPath = path.join(__dirname, "./public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  // console.log("New WebSocket Connection");
  // socket.emit("message", generateMessage("Welcome!"));
  // socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  socket.on("join", (option, callback) => {
    const { error, user } = addUser({ id: socket.id, ...option });
    if (error) {
      return callback(error);
    }
    socket.join(user.roomName);
    socket.emit("message", generateMessage("Welcome!"));
    socket.broadcast
      .to(user.roomName)
      .emit("message", generateMessage(`${user.username} has joined!`));
    io.to(user.roomName).emit("roomData", {
      roomName: user.roomName,
      users: getUsersInRoom(user.roomName),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new FILTER();
    if (filter.isProfane(message)) {
      callback("profanity is not allowed!");
      return;
    }
    if (user) {
      io.to(user.roomName).emit(
        "message",
        generateMessage(user.username, message)
      );
    }
    callback();
  });
  socket.on("sendLocation", (data, callback) => {
    console.log(data);
    const user = getUser(socket.id);
    if (user) {
      io.to(user.roomName).emit(
        "locationMessage",
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${data.latitude},${data.longitude}`
        )
      );
    }
    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.roomName).emit(
        "message",
        generateMessage(`${user.username} has left!`)
      );
      io.to(user.roomName).emit("roomData", {
        roomName: user.roomName,
        users: getUsersInRoom(user.roomName),
      });
    }
  });
});
server.listen(port, () => {
  console.log(`server is up on port ${port}!`);
});
