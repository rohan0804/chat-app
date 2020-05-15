const users = [];

const addUser = ({ id, username, roomName }) => {
  //clean the data
  username = username.trim().toLowerCase();
  roomName = roomName.trim().toLowerCase();
  //validate the data
  if (!username || !roomName) {
    return {
      error: "userName and roomName are required!",
    };
  }
  //check for existing user
  const existingUser = users.find((user) => {
    return user.roomName === roomName && user.username === username;
  });
  //   console.log(existingUser);
  //validate username
  if (existingUser) {
    return {
      error: "username is in use!",
    };
  }
  //store user
  const user = { id, username, roomName };
  users.push(user);
  return { user };
};
//to remove the user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
//to get the user
const getUser = (id) => {
  return users.find((user) => user.id === id);
};
//to get all the users in a room
const getUsersInRoom = (roomName) => {
  roomName = roomName.trim().toLowerCase();
  return users.filter((user) => user.roomName === roomName);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
