const REDIS_CONSTS = {
  REDIS_LEADERBOARD: 'REDIS_LEADERBOARD'
}

const DISTRIBUTE_PRIZE_RULES = {
  // ödül paylaştırma kuralının örnek tanımlaması
  top: {
    count: 3,
    amount: 45,
    order: [20, 15, 10]
  },
  other: {
    count: 97,
    amount: 55,
    order: []
  }
}

const WEEK_DAYS = 7;

module.exports = {
  REDIS_CONSTS,
  DISTRIBUTE_PRIZE_RULES,
  WEEK_DAYS
}