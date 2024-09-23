const { ObjectId } = require('mongodb')
const { GraphQLError } = require('graphql')
const { getDB } = require('../config/config')
const { addNewPost, fetchPostById } = require('../models')
const redis = require('../config/redis')

const collection = getDB().collection("Posts")

const postTypeDefs = `#graphql
  type Comments {
    content: String!
    username: String!
    name: String
    createdAt: String
    updatedAt: String
  }

  type Likes {
    username: String!
    createdAt: String
    updatedAt: String
  }
  
  input PostAddCommentData {
    content: String!
  }

  input PostNewPost {
    content: String!
    tags: [String]
    imgUrl: String
  }

  type Query {
    fetchAllPost: [Post]
    searchPostById(_id: ID!): Post
  }

  type Mutation {
    addNewPost(input: PostNewPost): Post
    addLikes(postId: ID): Post
    addComment(input: PostAddCommentData!, postId: ID!): Post
  }
`

const postResolver = {
  Query: {
    fetchAllPost: async (_, __, contextValue) => {
      const loginData = await contextValue.authentication()

      const agg = [
        {
          $lookup:
          {
            from: "Users",
            localField: "authorId",
            foreignField: "_id",
            as: "author"
          }
        },
        {
          $sort:
          {
            createdAt: -1
          }
        },
        {
          $unwind:
          {
            path: "$author",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project:
          {
            "author.password": 0
          }
        }
      ]

      const caching = await redis.get("data:posts")

      if (!caching) {
        const aggPost = await collection.aggregate(agg).toArray()
        return aggPost
      } else {
        const cachingPost = JSON.parse(caching)
        return cachingPost
      }

    }
  },
  Mutation: {
    addNewPost: async (_, args, contextValue) => {
      const loginData = await contextValue.authentication()
      console.log('===== ini data login data di schemas post =====', loginData);
      const { content, tags, imgUrl } = args.input

      const newPostData = {
        content,
        tags,
        imgUrl,
        authorId: new ObjectId(loginData.userId),
        comments: [],
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await redis.del("data:posts")

      if (!content || !authorId) {
        throw new GraphQLError('Content and authorId is required', {
          extensions: {
            http: {
              status: 400
            }
          }
        })
      }

      const result = await addNewPost(newPostData)
      console.log('===== Ini output post baru =====', result);

      const resultId = result.insertedId

      const queryData = {
        "_id": new ObjectId(resultId)
      }

      const checkPostId = await fetchPostById(queryData)

      if (!checkPostId) {
        throw new GraphQLError('Data Not Found', {
          extensions: {
            http: {
              status: 404
            }
          }
        })
      }

      return result
    },

    addLikes: async (_, args, contextValue) => {
      const loginData = await contextValue.authentication()
      const { postId } = args

      const addNewLikes = await collection.updateOne(
        { _id: new ObjectId(postId) },
        {
          $push: {
            likes: {
              username: loginData.username,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        }
      )



      const queryData = {
        _id: new ObjectId(postId)
      }

      const postLikes = await fetchPostById(queryData)

      return postLikes
    },

    addComment: async (_, args, contextValue) => {
      try {
        const loginData = await contextValue.authentication()
        const { postId } = args
        const { content } = args.input

        const newComment = await collection.updateOne(
          { _id: new ObjectId(postId) },
          {
            $push: {
              comments: {
                content,
                username: loginData.username,
                name: loginData.name,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          }
        )

        const findComment = await collection.findOne({ _id: new ObjectId(postId) })

        return findComment
      } catch (error) {
        console.log(error);
      }
    }
  }
}

module.exports = {
  postTypeDefs,
  postResolver
}