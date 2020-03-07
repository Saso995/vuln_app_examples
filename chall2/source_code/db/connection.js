
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});

var _db;

module.exports = {

  connectToServer: function( callback ) {
    client.connect(function( err, client ) {
      _db  = client.db('mydb');
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  }
};
