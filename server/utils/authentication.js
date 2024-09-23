const { GraphQLError } = require('graphql')
const { verifyToken } = require('../utils/jwt')
const { getDB } = require('../config/config')
const { ObjectId } = require('mongodb')
const { fetchUserById } = require('../models/index')

async function authentication(req) {
  const bearerToken = req.headers.authorization

  if (!bearerToken) {
    throw new GraphQLError('Invalid Error', {
      extensions: {
        http: {
          status: 401
        }
      }
    })
  }

  const token = bearerToken.split(' ')[1]

  const payload = verifyToken(token)

  const query = {
    "_id": new ObjectId(payload.userId)
  }

  const user = await fetchUserById(query)

  if (!user) {
    throw new GraphQLError('User not found', {
      extensions: {
        http: {
          status: 401
        }
      }
    })
  }

  console.log('===== ini data payload dari authen =====', payload);
  return payload
}

module.exports = authentication