const { ObjectId } = require('mongodb')
const { GraphQLError } = require('graphql')
const { fetchUserByEmail, fetchUserbyUsername, fetchUserById, registerNewUser } = require('../models')
const { signToken } = require('../utils/jwt')
const { comparePassword, hashPassword } = require('../helpers/bcrypt')
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const userTypeDefs = `#graphql
  type User {
    name: String
    username: String!
    email: String!
    password: String!
  }

  type UserMongoDb {
    _id: ID!
    name: String!
    username: String!
    email: String!
    password: String!
  }

  type UserRegisterData {
    _id: ID!
    name: String
    username: String
    email: String
    password: String
  }

  type UserFindUsernameData {
    username: String!
  }

  type UserFindIdData {
    _id: ID!
  }

  type Query {
    users: [UserMongoDb]
    searchUserByUsername(username: String!): UserFindByUsername
  }

  type Mutation {
    registerUser(name: String!, username: String!, email: String!, password: String!): UserRegisterResponse
    loginUser(username: String!, password: String!): UserLoginResponse
  }
`

const userResolvers = {
  Query: {
    searchUserByUsername: async (_, args) => {
      const { username } = args
      const userData = await fetchUserbyUsername(username)

      if (!userData) {
        throw new GraphQLError('Data Not Found', {
          extensions: {
            http: {
              status: 400
            }
          }
        })
      }

      return {
        status: 200,
        message: `Successfull find user`,
        data: userData
      }
    }
  },

  Mutation: {
    registerUser: async (_, args) => {
      const { name, username, email, password } = args

      const newUserData = {
        name, username, email, password: hashPassword(password)
      }

      if (!username || !email || !password) {
        throw new GraphQLError('Username, email, password is required', {
          extensions: {
            http: {
              status: 400
            }
          }
        })
      }

      const checkUsername = await fetchUserbyUsername(username)
      const checkEmail = await fetchUserByEmail(email)

      if (checkUsername || checkEmail) {
        throw new GraphQLError('Username or Email has already been taken', {
          extensions: {
            http: {
              status: 400
            }
          }
        })
      }

      if (!emailRegex.test(email)) {
        throw new GraphQLError('Invalid email format', {
          extensions: {
            http: {
              status: 400
            }
          }
        })
      }

      if (password.length < 5) {
        throw new GraphQLError('Password must have at least 5 character', {
          extensions: {
            http: {
              status: 400
            }
          }
        })
      }

      const result = await registerNewUser(newUserData)

      const resultId = result.insertedId

      const query = {
        "_id": new ObjectId(resultId)
      }

      const checkUserId = await fetchUserById(query)

      if (!checkUserId) {
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
        message: `New user have been added`,
        data: checkUserId
      }
    },

    loginUser: async (_, args) => {
      const { username, password } = args

      if (!username || !password) {
        throw new GraphQLError('Username and Password is required', {
          extensions: {
            http: {
              status: 400
            }
          }
        })
      }

      const loginData = await fetchUserbyUsername(username)

      console.log('===== ini data login =====', loginData);

      if (!loginData) {
        throw new GraphQLError('Invalid Login', {
          extensions: {
            http: {
              status: 401
            }
          }
        })
      }

      if (!comparePassword(password, loginData.password)) {
        throw new GraphQLError('Invalid Login', {
          extensions: {
            http: {
              status: 401
            }
          }
        })
      }

      const payload = {
        userId: loginData._id,
        username: loginData.username,
        name: loginData.name
      }

      console.log('===== ini payload dari file users =====', payload);

      const accessToken = signToken(payload)

      return {
        status: 200,
        message: "Login Succesfull",
        token: accessToken
      }
    }
  }
}

module.exports = {
  userTypeDefs,
  userResolvers
}