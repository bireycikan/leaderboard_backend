const modelUtils = require('../models/utils');
const debug = require('debug')('leaderboard_backend:dev')
const utils = require('../utils');

function createConnection(mongoose) {
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB } = process.env;
  const URI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB}`

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  };

  return mongoose.createConnection(URI, options)
}


function populateDB(model, modelName) {
  return async function (insertCount, times) {
    try {
      if (insertCount > 100000) throw new Error('Allowed insertCount value is 100K');
      else if (insertCount <= 0) return;
      if (times === 0) throw new Error('times cannot be equal to 0');
      else if (times < 0) return;

      if (await modelUtils.getModelCount(model)) return;

      let modelArray = [];
      let actualModel = null;

      for (let k = 1; k <= times; k++) {
        for (let i = 0; i < insertCount; i++) {
          actualModel = modelUtils.createModel(model, modelName);
          modelArray.push(actualModel);
          actualModel = null;
        }

        await model.insertMany(modelArray, { ordered: false })
        debug(`${modelName} BULK MODEL INSERTION IS SUCCESSFUL. (${k}. round trip)`);

        modelArray = [];
        await utils.waitForMem(1000);
      }
    } catch (err) {
      debug('POPULATE DB ERROR: %O', err)
    }
  }
}


module.exports = {
  createConnection,
  populateDB
}