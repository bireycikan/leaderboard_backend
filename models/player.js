module.exports = function (connection, mongoose) {
  const Schema = mongoose.Schema;

  const PlayerSchema = new Schema({
    country: String,
    username: String,
    money: {
      type: Number,
      index: true
    },
    dailydiff: Number
  });


  return connection.model('Player', PlayerSchema)
}