const socket = io();

socket.on("connect", function () {
  socket.emit("registration_request", { name: "roderick" });

  socket.on("registration_success", () => {
    localStorage.setItem("username", "roderick");
    window.location.replace("http://www.w3schools.com");
  });

  socket.on("flash", (data) => {
    alert(data);
  });
});
