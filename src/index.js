const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const app = express();
const { GenerateMessage } = require('./utils/messages');
const { GenereateLocationMessage } = require('./utils/location');

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');
//creates a new web server
const server = http.createServer(app);

//give the server a socketio instance
//socketio is a function that takes a server as an argument
//this is the same as calling socketio(server)

//now our server supports websockets
const io = socketio(server);

const PublicDirectoryPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;

app.use(express.static(PublicDirectoryPath));

//when a client connects to the server
//we will emit an event called 'connection'
//this event is listened to by the server
//the server will then call the callback function
//which will be executed when the event is emitted
let count = 0;

//socket is an object that contains information about the client
//socket is an representation of the client

//the socket is an object that contains information about the client
//in a way it represents the client
//if i have five cients on my chat app the socket param will run 5 times

//here we are saying that when a client connects to the server
//we will get the socket object(which contains information about the client)
//and we will print a message
//then we are setting up an event which runs when a client connects to out app(emits an event called 'connection')
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  //emmiting message event then the user connects
  //this will send the message to a particular client
  // socket.emit('Welcomemessage', GenerateMessage('Welcome to the chat app'));

  //this will emit the event to every client except the one that connected
  // socket.broadcast.emit('message', GenerateMessage('New user joined!'));

  socket.on('sendMessage', (m, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(m)) {
      return callback('Profanity is not allowed!');
    }

    io.to(user.room).emit('message', GenerateMessage(user.username, m));
    callback('Delivered!');
  });

  socket.on('disconnect', (m) => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        GenerateMessage('Avatar', `${user.username} has left`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on(
    'sendLocation',
    (pos, cb) => {
      const user = getUser(socket.id);
      io.to(user.room).emit(
        'locationMessage',
        GenereateLocationMessage(user.username, pos.latitude, pos.longitude)
      );
      cb('Location shared!');
    },
    () => {
      console.log('location shared');
    }
  );

  socket.on('join', ({ userName, room }, callback) => {
    console.log(userName, room);
    const { error, user } = addUser({
      id: socket.id,
      username: userName,
      room,
    });
    if (error) {
      return callback(error);
    }

    //this will help us to specifically emit an event to a particular room
    //so only people in a particular room will get the perticular message
    socket.join(user.room);

    socket.emit(
      'message',
      GenerateMessage('Admin', `Welcome to the chat app ${userName}`)
    );
    //broadcast.to(room).emit will send to all the client in a particular room
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        GenerateMessage('Admin', `${user.username} has joined!`)
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
    //socket.to.emit --> sends an event to everyone in a particular chat room
    //socket.broadcast.emit --> sends an event to everyone except the one that connected
  });

  //sending the client back some data
  //we are sending an event and the user will receive this event
  //the user will then receive the data

  //we can also transfer that such as the value for count
  //now anythng we provide to the second param
  //will be sent to the client
  //socket.emit('countUpdated', count);

  //we are going to listen to an event called 'increment'
  //this event is emitted by the client
  //when this event is emitted the server will run the callback function

  //this time we are going to be using socket on from the server
  //and when the event is emitted the server will respond

  //listen to an event called 'increment'
  //socket.on('increment', () => {
  //count++;

  //now we are emiting data back to the client!
  //this time with updated data!
  //we are sending an event called 'countUpdated'
  //so when the server recives the event increment
  //then it runs the callback function
  //and emits / send data back to the client
  //emit --> send data to the client
  //on --> listen for an event

  //this one emits the event to a particular client
  //io.emit('countUpdated', count);
  //while this one emits the event to all the clients
  //io.emit('countUpdated', count);
  //});
});
//starts the server
server.listen(PORT, () => {
  console.log(`please visit localhost:${PORT}`);
});
