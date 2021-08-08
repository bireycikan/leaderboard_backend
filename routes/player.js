const express = require('express');
const router = express.Router();
const redisDB = require('../utils/redisDB');
const constants = require('../utils/constants');
const utils = require('../utils');

// redis functions
const del = redisDB.redisFuncAsync('del');
const zrevrange = redisDB.redisFuncAsync('zrevrange');
const zrange = redisDB.redisFuncAsync('zrange');
const zrem = redisDB.redisFuncAsync('zrem');
const zincrby = redisDB.redisFuncAsync('zincrby');
const hgetall = redisDB.redisFuncAsync('hgetall');


async function getPlayers(req, offset, top, withScore) {
  top = top ? parseInt(top) - 1 : -1;
  offset = offset ? parseInt(offset) : 0;
  const topLimit = top + offset;

  let fromRedis = true;

  let players = withScore
    ? await zrevrange([constants.REDIS_CONSTS.REDIS_LEADERBOARD, offset, topLimit, 'WITHSCORES'])
    : await zrevrange([constants.REDIS_CONSTS.REDIS_LEADERBOARD, offset, topLimit])


  if (!players || !players.length) {
    top = 100;
    const Player = req.connection.model('Player');
    players = await Player.find({}).sort({ money: -1 }).limit(top).skip(offset);

    // write players data after we fetch data from mongodb
    await redisDB.seed(players, 'Player')
    fromRedis = false;
  }

  // for country and dailydiff
  const playersInfo = {};
  for (let i = 0; i < players.length; fromRedis ? i += 2 : i++) {
    if (fromRedis) playersInfo[players[i]] = await hgetall([`leaderboard:${players[i]}`])
    else playersInfo[players[i].username] = players[i];
  }

  return {
    players,
    playersInfo,
    fromRedis
  }
}

// get all players
router.get('/', async (req, res, next) => {
  try {
    let { top, offset } = req.query;

    const players = await getPlayers(req, offset, top, true);

    return res.json(players);
  } catch (error) {
    next(error);
  }
});


// reset players money
router.get("/reset", async (req, res, next) => {
  try {
    const Player = req.connection.model('Player');

    let players = await zrevrange([constants.REDIS_CONSTS.REDIS_LEADERBOARD, 0, -1]);

    for (let i = 0; i < players.length; i++) {
      // update mongodb data
      const player = await hgetall([`leaderboard:${players[i]}`])
      await Player.updateOne({ _id: player.id }, { money: 0 });
      // remove from redis
      await zrem([constants.REDIS_CONSTS.REDIS_LEADERBOARD, players[i]]);
      await del([`leaderboard:${players[i]}`])
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
})


// simulate one week money changes
router.get('/simulate', async (req, res, next) => {
  try {

    const io = req.app.get('io');

    let day = 1;
    let players = await zrevrange([constants.REDIS_CONSTS.REDIS_LEADERBOARD, 0, -1]);
    const playersInfo = {};
    const interval = setInterval(async () => {

      for (let k = 0; k < players.length; k++) {
        const randomMoney = utils.getRandomIntNumber(0, 1000);
        await zincrby([constants.REDIS_CONSTS.REDIS_LEADERBOARD, randomMoney, players[k]]);
        playersInfo[players[k]] = await hgetall([`leaderboard:${players[k]}`])
      }

      // players = await zrevrange([constants.REDIS_CONSTS.REDIS_LEADERBOARD, 0, -1, 'WITHSCORES']);

      io.emit('simulate', { players, playersInfo, day });
      day++;

      if (day > constants.WEEK_DAYS) clearInterval(interval);
    }, 2000);

    res.end();

  } catch (error) {
    next(error);
  }
})


// distribute prize pool
router.get('/calculate-prize-pool', async (req, res, next) => {
  try {
    let { ratio } = req.query;
    ratio = ratio ? parseInt(ratio) : 2;

    let { players, playersInfo, fromRedis } = await getPlayers(req, 0, 0, true);

    // let players = await zrevrange([constants.REDIS_CONSTS.REDIS_LEADERBOARD, 0, count, 'WITHSCORES']);
    let prizePool = utils.calculatePrizePool(players, ratio);
    prizePool = Math.floor(prizePool);

    // distribute
    await utils.distributePrizeAmongPlayers(players, prizePool, 0, constants.DISTRIBUTE_PRIZE_RULES);
    players = await zrevrange([constants.REDIS_CONSTS.REDIS_LEADERBOARD, 0, -1, 'WITHSCORES']);

    res.json({ players, playersInfo, prizePool, fromRedis });

  } catch (error) {
    next(error);
  }
})


module.exports = router;
