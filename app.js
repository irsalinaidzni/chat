const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require('mongoose')
require("dotenv").config();
const PORT = process.env.PORT || 4001;
const userRoute = require("./routes/user");
const groupRoute = require("./routes/group");
const chatRoute = require("./routes/chat");

const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)

// connect ke database
/*mongoose.connect(
  "mongodb://anhar:admin123@ds253857.mlab.com:53857/heroku_user_db",
  { useNewUrlParser: true }
);*/

mongoose.connect(
  'mongodb://localhost:27017/IChat',
  { useNewUrlParser: true }
);

server.listen(PORT, () => {
  console.log('server app running on port', PORT)
})

app.use(bodyParser.json());
app.use(cors());

// app.get("/", (req, res) => {
//   res.send("hello from server app.js");
// });

app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res) {
  res.sendFile(__dirname+'/public/index.html')
})

app.use("/users", userRoute);
app.use("/groups", groupRoute);
app.use("/chats", chatRoute);

// app.listen(port, () => {
//   console.log("server running on port", port);
// });

app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res) {
  res.sendFile(__dirname+'/public/index.html')
})

io.on('connection', function(socket){
  socket.on('chat', function(data) {
      io.emit('chat', data)
  })

  socket.on('group', function(data) {
    io.emit('group', data)
  })

  socket.on('friend', function(data) {
    io.emit('friend', data)
  })

  socket.on('sendFile', function(msg) {
    // console.log('received base64 file from' + JSON.stringify(msg));
    // console.log(msg.username)
    socket.username = msg.username;
    // socket.broadcast.emit('base64 image', //exclude sender
    io.sockets.emit('sendFile',  //include sender
        {
          username: "username",
          file: msg.file,
          fileName: msg.fileName
        }
    );
  })
})


module.exports = app;
