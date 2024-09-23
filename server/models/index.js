const { getDB } = require('../config/config')
const { ObjectId } = require('mongodb')

const userCollection = "Users"
const postCollection = "Posts"
const followCollection = "Follows"

const fetchUserbyUsername = async (username) => {
  const db = await getDB()

  const regex = new RegExp(`.*${username}.*`, 'i')

  const result = await db.collection(userCollection).findOne({ username: regex })

  return result
}

const fetchUserByEmail = async (email) => {
  const db = await getDB()
  const result = await db.collection(userCollection).findOne({ email })

  return result
}

const fetchUserById = async (query) => {
  const db = await getDB()
  const result = await db.collection(userCollection).findOne(query, {
    projection: {
      password: 0
    }
  })

  return result
}

const registerNewUser = async (newUserData) => {
  const db = await getDB()
  const result = await db.collection(userCollection).insertOne(newUserData)

  return result
}

const fetchPostById = async (queryData) => {
  const db = await getDB()
  const result = await db.collection(postCollection).findOne(queryData)

  return result
}

const addNewPost = async (newPostData) => {
  const db = await getDB()
  const result = await db.collection(postCollection).insertOne(newPostData)

  return result
}

const fetchFollowById = async (followIdQuery) => {
  const db = await getDB()
  const result = await db.collection(followCollection).findOne(followIdQuery)

  return result
}

const addNewFollow = async (newFollower) => {
  const db = await getDB()
  const result = await db.collection(followCollection).insertOne(newFollower)

  return result
}

module.exports = {
  fetchUserbyUsername,
  fetchUserByEmail,
  fetchUserById,
  registerNewUser,
  addNewPost,
  fetchPostById,
  fetchFollowById,
  addNewFollow
}