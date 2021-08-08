// cors setting
const whiteList = [process.env.FRONT_END_SERVER_URI];
var corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

module.exports = {
  corsOptions
}