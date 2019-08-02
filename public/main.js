$(document).ready(function() {
  var socket = io();
  var data = null;
  const url = 'http://localhost:4001'

  function loginPage() {
    $("#registerPage").hide();
    $("#wrapperChat").hide();
    $("#loginPage").show();
  }

  function registerPage() {
    $("#wrapperChat").hide();
    $("#loginPage").hide();
    $("#registerPage").show();
  }

  function chatPage() {
    $("#loginPage").hide();
    $("#registerPage").hide();
    $("#inputFile").hide();
    $("#cancelAddFile").hide();
    $("#wrapperChat").show();
  }

  function addFile() {
    $("#inputFile").show();
    $("#cancelAddFile").show();
  }

  function checkLogin() {
    if (localStorage.token && localStorage.email && localStorage.name) {
      chatPage();
    } else {
      loginPage();
    }
  }

  function login(e) {
    e.preventDefault();
    //action axios ke endpoint login
    axios({
      url: `${url}/users/login`,
      method: "post",
      data: {
        email: $("#emailLogin").val(),
        password: $("#passwordLogin").val()
      }
    })
      .then(res => {
        Swal.fire("Sukses login");
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("token", res.data.token);
        chatPage();
      })
      .catch(error => {
        console.log(
          "ERROR",
          _.get(error, "response.data.message", "cannot login")
        );
        Swal.fire(_.get(error, "response.data.message", "cannot login"));
        loginPage();
      });
  }

  function readThenSendFile(data) {
    var socket = io();
    var reader = new FileReader();
    reader.onload = function(evt) {
      var msg = {};
      console.log("data", data);
      console.log("evt", evt);
      msg.username = "anhar";
      msg.file = evt.target.result;
      msg.fileName = data.name;
      socket.emit("sendFile", msg);
    };
    reader.readAsDataURL(data);
  }

  function addGroup() {
    Swal.fire({
      title: 'Add Group',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Create',
      showLoaderOnConfirm: true,
      preConfirm: (name) => {
        return axios({
          url: `${url}/groups`,
          method: 'POST',
          data: {
            name,
            createdBy: localStorage.email
          }
        })
          .then(response => {
            getGroup()
            return response.data
          })
          .catch(error => {
            Swal.showValidationMessage(
              `Request failed: ${error}`
            )
            getGroup()
          })
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      // if cancel will get result {dismiss: "cancel"}
      if (result.value) {
        Swal.fire({
          title: `sukses create Group`
        })
        // getGroup()
      }
      getGroup()
    })
  }

  function addFriend() {
    alert("action untuk add friend");
  }

  chatPersonal = function (id) {
    console.log('asdasd')
    alert('chat personal'+ id)
  }

  chatGroup = function (id) {
    console.log('asdasd')
    alert('chat group'+ id)
  }

  async function getFriend() {
    try {
      const user = await axios.get(`${url}/users/search?email=${localStorage.email}`)
      if(user) {
        // console.log(user.data.users.friends)
        const friends = user.data.users.friends
        $("#listFriend").empty()
        friends.map( friend => {
          $("#listFriend").append(`<button class="group" onclick="chatPersonal('${friend._id}')">${friend.name}</button>`)
        })
      } else {
        console.log('user not found')
      }
    } catch(error) {
      console.log(error)
    }
  }
  

  async function getGroup() {
    try {
      const user = await axios.get(`${url}/users/search?email=${localStorage.email}`)
      if(user) {
        // console.log(user.data.users.groups)
        const groups = user.data.users.groups
        $("#listGroup").empty()
        groups.map( group => {
          $("#listGroup").append(`<button class="group" onclick="chatGroup('${group._id}')">${group.name}</button>`)
        })
      } else {
        console.log('user not found')
      }
    } catch(error) {
      console.log(error)
    }
  }

  function inviteFriend() {

  }

  function goChatPesonal() {

  }

  function goChatGroup() {

  }

  function logout() {
    // alert("action untuk logout");
    localStorage.clear()
    loginPage()
  }

  $("#loginForm").submit(function(e) {
    login(e);
  });

  $("#btnLogin").click(function(e) {
    login(e);
  });

  $("#btnToRegister").click(function(e) {
    e.preventDefault();
    registerPage();
  });

  $("#btnToLogin").click(function(e) {
    e.preventDefault();
    loginPage();
  });

  $("#addFile").click(function(e) {
    e.preventDefault();
    addFile();
  });

  $("#cancelAddFile").click(function(e) {
    e.preventDefault();
    chatPage();
  });

  $("#addGroup").click(function(e) {
    e.preventDefault();
    addGroup()
  });

  $("#addFriend").click(function(e) {
    e.preventDefault();
    addFriend()
  });

  $("#btnLogout").click(function(e) {
    e.preventDefault();
    logout()
  });

  socket.on("chat", function(data) {
    $("#listmessage").append(
      $("<h6 class='senderName'>").text(data.name),
      $("<h5>").text(data.content),
      $("<p class='createdAt'>").text(moment(new Date()).format("lll")),
      $("<hr/>")
    );
  });

  socket.on("sendFile", function(data) {
    console.log("data send FIle ", data);
    $("#listmessage").append(
      $("<h6 class='senderName'>").text(localStorage.name),
      $(
        `<a target="_blank" download rel="noopener noreferrer" 
          href="${data.file}" id="filedownload${data.fileName}">
          ${data.fileName}
        </a>
        <br>
        `
      ),
      $("<p class='createdAt'>").text(moment(new Date()).format("lll")),
      $("<hr/>")
    );
   });

  $("#btnSendFile").click(function() {
    console.log("click send File");
    console.log(data);
    readThenSendFile(data);
  });

  $("#inputFile").change(function(e) {
    console.log("onChange=", e.target.files);
    data = e.target.files[0];
    $("#inputChat").val(e.target.files[0].name);
  });

  $("#btnSendChat").click(function(e) {
    e.preventDefault();
    if ($("#inputChat").val()) {
      socket.emit("chat", ({ name: localStorage.name, content: $("#inputChat").val() }));
      $("#inputChat").val("");
    }

    if (data) {
      readThenSendFile(data);
    }
  });

  $("#formChat").submit(function(e) {
    e.preventDefault();
    console.log('sbmit  chat')
    if ($("#inputChat").val()) {
      socket.emit("chat", ({ name: localStorage.name, content: $("#inputChat").val() }));
      $("#inputChat").val("");
    }

    if (data) {
      readThenSendFile(data);
    }
  });

  checkLogin();
  getFriend()
  getGroup()
});
