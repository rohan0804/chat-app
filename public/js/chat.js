const socket = io();
const form = document.querySelector("#messageForm"),
  messageInput = document.querySelector("#message"),
  sendMessageBtn = document.querySelector("#sendMessageBtn"),
  sendLocationBtn = document.querySelector("#sendLocationBtn"),
  messages = document.querySelector("#messages"),
  messageTemplate = document.querySelector("#message-template").innerHTML,
  locationMessageTemplate = document.querySelector("#location-message-template")
    .innerHTML,
  usersListTemplate = document.querySelector("#users-list").innerHTML;

const { username, roomName } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", (msg) => {
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (data) => {
  console.log(data);
  const html = Mustache.render(locationMessageTemplate, {
    username: data.username,
    url: data.url,
    createdAt: moment(data.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

socket.on("roomData", ({ roomName, users }) => {
  console.log(roomName, users);
  const html = Mustache.render(usersListTemplate, {
    roomName,
    users,
  });
  document.querySelector("#usersData").innerHTML = html;
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessageBtn.setAttribute("disabled", "disabled");
  const message = messageInput.value;
  socket.emit("sendMessage", message, (error) => {
    sendMessageBtn.removeAttribute("disabled");
    messageInput.value = "";
    messageInput.focus();
    if (error) {
      console.log(error);
      return;
    }
    console.log("Message is deleivered sucessfully!");
  });
});

sendLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    sendLocationBtn.setAttribute("disabled", "disabled");
    // console.log(position);
    socket.emit(
      "sendLocation",
      {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      },
      () => {
        sendLocationBtn.removeAttribute("disabled");
        console.log("location shared!");
      }
    );
  });
});
socket.emit("join", { username, roomName }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
