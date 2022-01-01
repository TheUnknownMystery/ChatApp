//this io function will be called when a client connects to the server
//we will listen for an event called 'connection'
//and also means our client is able to use websockets

//getting the return value from the server
//this will help us to send and recive event

//to accept the return value from the emit
//we store the io() function in a var called socket

const socket = io();

//--elements--
const $messageForm = document.querySelector('#message-form');
const $button = document.querySelector('#send');
const $input = document.querySelector('#message');

const $send_location = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
//on will accept the event which defined in the server
//the name should match the event name in the server

//we are accepting/listening to the event called 'countUpdated'

//we can either send an event or recive one
//here we want to listen for the event or want to recive a custom event
//the custom event is defined in the server
//and we are listening for it
//when that event is recived we do something with that event
//we get access to the count obj sent from the server
// socket.on('countUpdated', (count) => {
//   console.log(`the count has been updated to ${count}`);
// });

// const button = document
//   .querySelector('#Increment')
//   .addEventListener('click', () => {
//     console.log('clicked');

//     //we are emitting an event called 'increment' from the client
//     socket.emit('increment');
//   });

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);

  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  const visibleHeight = $messages.offsetHeight;
  const containerHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('Welcomemessage', (welcomeObj) => {
  console.log(welcomeObj.text);
});

//getting message data emited by the server
socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

$button.addEventListener('click', (e) => {
  e.preventDefault();
  $button.setAttribute('disabled', 'disabled');

  const message = $input.value;

  socket.emit('sendMessage', message, (error) => {
    $button.removeAttribute('disabled');
    if (error) return console.log(error);
    //console.log('message delivered', message);
  });

  $input.value = '';
  $input.focus();
});

$send_location.addEventListener('click', () => {
  //somebrowsers dont support geolocation apis

  //if you browser doesnt support geolocation apis
  if (!navigator.geolocation) {
    return alert('geolocation is not supported by your browser');
  }

  $send_location.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit('sendLocation', { latitude, longitude }, () => {
      //console.log('location shared');
      $send_location.removeAttribute('disabled');
    });
  });
});

socket.on('locationMessage', (url) => {
  const html = Mustache.render(locationTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

const { userName, room } = Qs.parse(window.location.search, {
  ignoreQueryPrefix: true,
});

socket.emit('join', { userName, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

socket.on('roomData', ({ room, users }) => {
  console.log(room, users);
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector('#sidebar').innerHTML = html;
});
