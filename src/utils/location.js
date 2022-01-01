const GenereateLocationMessage = (username, latitude, longitude) => {
  return {
    username,
    url: `https://google.com/maps?q=${latitude},${longitude}`,
    createdAt: new Date().getTime(),
  };
};
module.exports = { GenereateLocationMessage };
