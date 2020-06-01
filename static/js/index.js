const socket = io();

window.addEventListener("DOMContentLoaded", (event) => {
  // Important DOM elements available in all templates
  const el = document.getElementById("app");
  const flash = document.getElementById("flash");

  socket.on("connect", function () {
    // everything after must be connected
    // Handlebars
    const errorScript = document.getElementById("error-template");
    const registrationScript = document.getElementById("registration-template");
    const chatScript = document.getElementById("chat-template");

    const errorTemplate = Handlebars.compile(errorScript.innerHTML);
    const chatTemplate = Handlebars.compile(chatScript.innerHTML);
    const registrationTemplate = Handlebars.compile(
      registrationScript.innerHTML
    );

    // Router
    var router = new Router({
      mode: "history",
      page404: function (path) {
        console.log('"/' + path + '" Page not found');
      },
    });

    router.add("", function () {
      socket.emit("request_session_id");

      const username = localStorage.getItem("username");
      const session_id = socket.id;
      console.log("SESSION ID", session_id);

      if (username) {
        socket.emit("login_request", { username });
      } else {
        router.navigateTo("register");
      }

      socket.on("login_fail", () => {
        localStorage.clear();
        router.navigateTo("register");
      });

      socket.on("login_success", (data) => {
        const room = "atrium";
        console.log(data["username"]);
        router.navigateTo(`chat/${room}`);
      });
    });

    router.add("chat/(:word)", (channel) => {
      let html = chatTemplate();
      el.innerHTML = html;
      session_id = socket.id;

      const chatMessageForm = document.getElementById("chat-message-form");
      const createChannelForm = document.getElementById("create-channel-form");
      const usernameBoard = document.getElementById("username");
      const usersBoard = document.querySelector(".users");
      const chatMessages = document.querySelector(".messages");
      const username = localStorage.getItem("username");

      usernameBoard.innerHTML = username;
      // todo join channel
      socket.emit("join_channel", { channel, session_id });

      console.log(channel);

      chatMessageForm.onsubmit = (e) => {
        e.preventDefault();

        const msg = e.target.msg.value;

        if (msg.length > 3) {
          // push the message
          socket.emit("push_message", { channel, msg, username });
          e.target.elements.msg.value = "";
          e.target.elements.msg.focus();
        }
      };

      createChannelForm.onsubmit = (e) => {
        e.preventDefault();

        const channel = e.target.channel.value;
        if (channel) {
          alert(`The channel is ${channel}`);
        }
      };

      socket.on("refresh_messages", (data) => {
        const messages = data["messages"];
        chatMessages.innerHTML = "";

        messages.map((message) => {
          const div = document.createElement("div");
          div.classList.add("message");
          div.innerHTML = `
          <p class="meta">${message.username} <span>${message.time}</span><p>
            <p class="text">
            ${message.text}
           </p>`;
          chatMessages.appendChild(div);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });

      socket.on("refresh_users", (data) => {
        console.log(data.users);
      });
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

    /* Flash message handler. Available to all templates. */
    socket.on("flash", (msg) => {
      flash.innerHTML = msg;
      setTimeout(() => {
        flash.innerHTML = "";
      }, 5000);
    });

    router.addUriListener();
    router.navigateTo("");
  });
});
