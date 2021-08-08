const redis = require('redis');
const debug = require('debug')('leaderboard_backend:dev')
const { promisify } = require("util");
const constants = require('./constants');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB
});

const redisFuncAsync = (func) => {
  return promisify(client[func]).bind(client);
};

const seed = async (modelArray, modelName) => {
  try {

    if (modelArray && modelArray.length) {
      if (modelName === "Player") {
        for (let k = 0; k < modelArray.length; k++) {
          await redisFuncAsync('zadd')([
            constants.REDIS_CONSTS.REDIS_LEADERBOARD,
            modelArray[k].money,
            modelArray[k].username,
          ])

          await redisFuncAsync('hset')([
            `leaderboard:${modelArray[k].username}`,
            'id',
            modelArray[k]._id.toString(),
            'username',
            modelArray[k].username,
            'country',
            modelArray[k].country,
            'money',
            modelArray[k].money,
            'dailydiff',
            modelArray[k].dailydiff
          ])
        }
      }

      debug(`Redis Db seeded with ${modelArray.length} document.`)
    }
  } catch (err) {
    debug('SEED REDIS DB ERROR: %O', err);
  }
}


module.exports = {
  seed,
  redisFuncAsync
}