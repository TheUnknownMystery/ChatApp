const users = [];

const addUser = ({ id, username, room }) => {
  console.log(username);
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'Username and room are required!',
    };
  }

  const isExistingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (isExistingUser) {
    return {
      error: 'Username is taken!',
    };
  }

  const user = { id, username, room };
  users.push(user);

  return { user };
};

const test1 = addUser({ id: 1, username: 'mike', room: 'node' });
const test2 = addUser({ id: 2, username: 'nig', room: 'node' });
// console.log(test2);
// console.log(users);

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//removeUser(2);
//console.log(users);

const getUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  return users[index];
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};
// let f = getUsersInRoom('node');
// console.log(f);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
