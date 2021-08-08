const _ = require('lodash');
const redisDB = require('../utils/redisDB');
const constants = require('../utils/constants');


const zadd = redisDB.redisFuncAsync('zadd');

function waitForMem(ms) {
  return new Promise((resolve, reject) => {
    try {
      process.nextTick(() => {
        resolve()
      }, ms);
    } catch (error) {
      reject(error);
    }
  })
}


function getRandomIntNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function calculatePrizePool(players, calcRatio) {
  if (!_.isArray(players)) throw new Error('players must be an array');
  if (!_.isNumber(calcRatio)) throw new Error('calcRatio must be a number');

  if (!players.length) return;

  if (calcRatio < 0) throw new Error('calcRatio cannot be negative number');
  if (calcRatio > 101) throw new Error('calcRatio cannot be greater than 101');

  let prizePool = 0;
  const percentage = calcRatio / 100;

  for (let i = 1; i < players.length; i += 2) {
    prizePool += players[i] * percentage;
  }

  return prizePool;
}

function getTopPlayersByCount(players) {
  return function (topPlayerCount) {
    if (!_.isArray(players)) throw new Error('players must be an array');
    if (!players.length) return;

    if (topPlayerCount) return _.slice(players, 0, topPlayerCount);

    return players;
  }
}


async function distributePrizeAmongPlayers(players, prizePool, topPlayerCount, distributeRules) {
  if (!_.isArray(players)) throw new Error('players must be an array');
  if (!_.isNumber(prizePool)) throw new Error('prizePool must be a number');
  if (!_.isNumber(topPlayerCount)) throw new Error('topPlayerCount must be a number');
  if (!_.isObject(distributeRules)) throw new Error('distributeRules must be an array');


  // distribute rules validation check ler eklenecek //TODO
  const topCountPlayers = getTopPlayersByCount(players)(topPlayerCount);
  // distribute prize among top players according to the rules
  const top = distributeRules.top;
  const other = distributeRules.other;

  let topCheck = distributeRules.top.count;
  let otherTopCheck = distributeRules.other.count;


  for (let i = 1; i < topCountPlayers.length; i += 2) {
    if (topCheck) {
      const distributePercentage = !top.order.length ? (top.amount / 100) / top.count : top.order[top.count - topCheck] / 100;
      const playerPrize = Math.floor((prizePool * distributePercentage) + parseInt(topCountPlayers[i]));
      await zadd([constants.REDIS_CONSTS.REDIS_LEADERBOARD, 'XX', playerPrize, topCountPlayers[i - 1]]);
      topCheck--;
    }
    else if (otherTopCheck) {
      const distributePercentage = !other.order.length ? (other.amount / 100) / other.count : other.order[other.count - otherTopCheck] / 100;
      const playerPrize = Math.floor((prizePool * distributePercentage) + parseInt(topCountPlayers[i]));
      await zadd([constants.REDIS_CONSTS.REDIS_LEADERBOARD, 'XX', playerPrize, topCountPlayers[i - 1]]);
      otherTopCheck--;
    }
  }
}


function getRankingData(playerRank, firstTopCount, aboveCount, belowCount) {
  if (!_.isNumber(playerRank)) throw new Error('playerRank must be a number');
  if (!_.isNumber(firstTopCount)) throw new Error('firstTopCount must be a number');
  if (!_.isNumber(aboveCount)) throw new Error('aboveCount must be a number');
  if (!_.isNumber(belowCount)) throw new Error('firstTopCount must be a number');


}

module.exports = {
  getRandomIntNumber,
  calculatePrizePool,
  distributePrizeAmongPlayers,
  waitForMem
}