const { MongoClient } = require("mongodb");
const db = process.env.ATLAS_URI;
const client = new MongoClient(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 
var _db;
 
module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      if (db)
      {
        _db = db.db("ecommerce");
        console.log("Successfully connected to MongoDB."); 
      }
      return callback(err);
      });
  },
 
  getDb: function () {
    return _db;
  },
};

