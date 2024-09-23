const { MongoClient } = require('mongodb')
require('dotenv').config()

const uri = process.env.MONGODB_CON_STRING
const client = new MongoClient(uri)

const dbName = 'X-Mockup'

async function connectMongo() {
  try {
    client.db(dbName)
    console.log("You successfully connected to MongoDB!");
    return 'done'
  } catch (error) {
    console.log('Failed to connect to MongoDB', error);
  }
}

function getDB() {
  return client.db(dbName)
}

module.exports = {
  connectMongo,
  getDB
}