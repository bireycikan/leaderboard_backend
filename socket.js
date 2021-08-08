module.exports = function (app, server) {
  const debug = require('debug')('leaderboard_backend:dev');
  const socketIo = require('socket.io');

  const socketOptions = {
    cors: {
      origin: "http://localhost:3000",
    }
  }

  const io = socketIo(server, socketOptions)
  app.set('io', io);
  const connection = app.get('connection');

  io.on('connection', async (socket) => {
    const playerCount = await connection.model('Player').count();
    socket.emit('playerCount', playerCount);

    debug('CLIENT CONNECTED!')
  })

}