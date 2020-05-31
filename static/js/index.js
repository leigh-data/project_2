const socket = io();

window.addEventListener("DOMContentLoaded", (event) => {
  // Important DOM elements
  const el = document.getElementById("app");
  const flash = document.getElementById("flash");

  // Handlebars
  const errorScript = document.getElementById("error-template");
  const registrationScript = document.getElementById("registration-template");
  const chatScript = document.getElementById("chat-template");

  const errorTemplate = Handlebars.compile(errorScript.innerHTML);
  const chatTemplate = Handlebars.compile(chatScript.innerHTML);
  const registrationTemplate = Handlebars.compile(registrationScript.innerHTML);

  // Router
  var router = new Router({
    mode: "history",
    page404: function (path) {
      console.log('"/' + path + '" Page not found');
    },
  });

  router.add("", function () {
    const username = localStorage.getItem("username");
    if (username) {
      let html = chatTemplate();
      el.innerHTML = html;

      const chatMessageForm = document.getElementById("chat-message-form");
      const createChannelForm = document.getElementById("create-channel-form");
      const usernameBoard = document.getElementById("username");
      const username = localStorage.getItem("username");
      usernameBoard.innerHTML = username;

      chatMessageForm.onsubmit = (e) => {
        e.preventDefault();

        const msg = e.target.msg.value;

        if (msg) {
          alert(msg);
        }
      };

      createChannelForm.onsubmit = (e) => {
        e.preventDefault();

        const channel = e.target.channel.value;
        if (channel) {
          alert(`The channel is ${channel}`);
        }
      };
    } else {
      router.navigateTo("register");
    }
  });

  router.add("register", function () {
    let html = registrationTemplate();
    el.innerHTML = html;

    const registrationForm = document.getElementById("registration-form");

    registrationForm.onsubmit = (e) => {
      e.preventDefault();
      const username = e.target.username.value;

      if (username.length > 3) {
        socket.emit("registration_request", { username });
      } else {
        flash.innerHTML =
          "You must enter a valid name greater than 3 characters.";
      }
    };

    socket.on("registration_success", (data) => {
      localStorage.setItem("username", data.username);
      router.navigateTo("");
    });
  });

  socket.on("flash", (msg) => {
    flash.innerHTML = msg;
  });

  router.addUriListener();
  router.navigateTo("");
});
