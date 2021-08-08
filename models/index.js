const player = require('./player');

module.exports = function (connection, mongoose) {
  return {
    Player: player(connection, mongoose)
  }
}