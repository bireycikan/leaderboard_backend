const randomCountry = require('random-country');
const { uniqueNamesGenerator, adjectives, names } = require('unique-names-generator');
const utils = require('../utils');


async function getModelCount(model) {
  return await model.collection.count();
}


function createModel(model, modelName) {
  let createdModel = null;

  if (modelName === 'Player') {
    const random_name = uniqueNamesGenerator({ dictionaries: [adjectives, names] }).toLocaleLowerCase();
    const random_country = randomCountry({ full: true })
    const random_money = utils.getRandomIntNumber(1, 100000)

    createdModel = new model({
      country: random_country,
      username: random_name,
      money: random_money,
      dailydiff: 0
    })
  }

  return createdModel;
}


module.exports = {
  getModelCount,
  createModel
}