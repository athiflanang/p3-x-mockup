const { ObjectId } = require('mongodb')
const { GraphQLError } = require('graphql')
const { fetchFollowById, addNewFollow } = require('../models')

const followTypeDefs = `#graphql
  type FollowAddNewData {
    _id: ID
    followingId: ID!
    followerId: ID
    createdAt: String
    updatedAt: String
  }

  type Mutation {
    followUser(followingId: ID): FollowAddNewFollow
  }
`

const followResolvers = {
  Mutation: {
    followUser: async (_, args, contextValue) => {
      const { followingId } = args

      const { userId } = await contextValue.authentication()

      const newFollower = {
        followingId: new ObjectId(followingId),
        followerId: new ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await addNewFollow(newFollower)

      const resultId = result.insertedId

      const queryFollow = {
        "_id": new ObjectId(resultId)
      }

      const checkFollowId = await fetchFollowById(queryFollow)

      if (!checkFollowId) {
        throw new GraphQLError('Data Not Found', {
          extensions: {
            http: {
              status: 404
            }
          }
        })
      }

      return {
        status: 201,
        message: `New Follower have been added`,
        data: checkFollowId
      }
    }
  }
}

module.exports = {
  followTypeDefs,
  followResolvers
}