
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});
const port = process.env.PORT || 3000;


server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

app.route('/').get((req, res) => {
    return res.json('Connected');
});

// Chatroom

let numUsers = 0;

io.on('connection', (socket) => {
  let addedUser = false;

  socket.on('new message', (data) => {
    socket.broadcast.emit('new message', JSON.stringify({
      username: socket.username,
      message: data
    }));
  });

  socket.on('add user', (username) => {
    if (addedUser) return;

    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', JSON.stringify({
      numUsers: numUsers
    }));

    socket.broadcast.emit('user joined', JSON.stringify({
      username: socket.username,
      numUsers: numUsers
    }));
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', JSON.stringify({
      username: socket.username
    }));
  });

  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', JSON.stringify({
      username: socket.username
    }));
  });

  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      socket.broadcast.emit('user left', JSON.stringify({
        username: socket.username,
        numUsers: numUsers
      }));
    }
  });
});