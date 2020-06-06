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

    const flash_message = (msg) => {
      flash.innerHTML = `
      <div class="alert alert-primary" role="alert">
        ${msg}
      </div>`;
      setTimeout(() => {
        flash.innerHTML = "";
      }, 5000);
    };

    // Router
    var router = new Router({
      mode: "history",
      page404: function (path) {
        console.log('"/' + path + '" Page not found');
      },
    });

    router.add("", function () {
      const username = localStorage.getItem("username");
      const session_id = socket.id;

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
        const channel = data["channel"];
        console.log(data["username"]);
        router.navigateTo(`chat/${channel}`);
      });
    });

    router.add("chat/(:any)", (channel) => {
      let html = chatTemplate();
      el.innerHTML = html;
      session_id = socket.id;

      const chatMessageForm = document.getElementById("chat-message-form");
      const createChannelForm = document.getElementById("create-channel-form");
      const usernameBoard = document.getElementById("username");
      const usersBoard = document.querySelector(".users > ul");
      const channelsBoard = document.querySelector(".channels > ul");
      const chatMessages = document.querySelector(".messages");
      const username = localStorage.getItem("username");
      const channelName = document.querySelector(".channel");

      usernameBoard.innerHTML = username;
      channelName.innerHTML = channel;
      socket.emit("join_channel", { channel, session_id });

      chatMessageForm.onsubmit = (e) => {
        e.preventDefault();

        const msg = e.target.msg.value;

        if (msg.length > 3 && msg.length < 126) {
          // push the message
          socket.emit("push_message", { channel, msg, username });
          e.target.elements.msg.value = "";
          e.target.elements.msg.focus();
        }

        // add validation alert
        if (msg.length > 126) {
          flash_message("The message is too long.");
        }
      };

      createChannelForm.onsubmit = (e) => {
        e.preventDefault();

        const channel = e.target.channel.value;
        if (channel) {
          socket.emit("channel_request", { channel });
          e.target.elements.channel.value = "";
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
        const users = data["users"];
        usersBoard.innerHTML = "";

        users.map((user) => {
          const li = document.createElement("li");
          li.classList.add("list-group-item");
          li.innerHTML = `${user.username}`;

          if (user.username === username) {
            li.classList.add("font-weight-bold");
          }

          usersBoard.appendChild(li);
        });
      });

      socket.on("refresh_channels", (data) => {
        const channels = data["channels"];
        channelsBoard.innerHTML = "";

        channels.map((next_channel) => {
          const li = document.createElement("li");
          li.classList.add("list-group-item");
          li.innerHTML = `${next_channel}`;
          if (next_channel !== channel) {
            li.onclick = () => {
              socket.emit("leave_channel", { channel });
              router.navigateTo(`chat/${next_channel}`);
            };
          } else {
            li.classList.add("font-weight-bold");
          }

          channelsBoard.appendChild(li);
        });
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
    socket.on("flash", flash_message);

    router.addUriListener();
    router.navigateTo("");
  });
});
