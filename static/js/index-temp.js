const socket = io();

window.addEventListener("DOMContentLoaded", (event) => {
  // Key DOM items
  const el = document.getElementById("app");
  const errorDiv = document.getElementById("error-template");
  const registrationDiv = document.getElementById("registration-template");
  const chatDiv = document.getElementById("chat-template");

  // Templates
  const errorTemplate = Handlebars.compile(errorDiv.innerHTML);
  const registrationTemplate = Handlebars.compile(registrationDiv.innerHTML);
  const chatTemplate = Handlebars.compile(chatDiv.innerHTML);

  // Routing
  var router = new Router({
    mode: "history",
    page404: function (path) {
      console.log("Unable. Malfunction. Need Input!");
    },
  });

  router.add("", function () {
    console.log("Home page");
  });

  router.add("register", () => {
    console.log("Register");
  });

  router.addUriListener();

  router.navigateTo("/");

  //   router.add("/", () => {
  //     let html = chatTemplate();
  //     el.innerHTML = html;
  //   });

  //   router.add("register", () => {
  //     let html = registrationTemplate();
  //     el.innerHTML = html;
  //   });

  //   router.addUriListener();

  //   router.navigateTo("register");
  console.log(registrationTemplate());
  console.log(chatTemplate());

  // Socket.io handlers
  socket.on("connect", function () {
    if (localStorage.getItem("username")) {
      alert(localStorage.getItem("username"));
    } else {
      socket.emit("registration_request", { name: "roderick" });
    }

    socket.on("registration_success", () => {
      localStorage.setItem("username", "roderick");
      window.location.replace("http://www.w3schools.com");
    });

    socket.on("flash", (data) => {
      alert(data);
    });
  });
});
