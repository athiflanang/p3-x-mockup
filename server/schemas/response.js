const responseTypeDefs = `#graphql
  interface Response {
    status: String!
    message: String
  }

  type UserResponse implements Response {
    status: String!
    message: String
    data: User
  }

  type UserMongoDbResponse implements Response {
    status: String!
    message: String
    data: UserMongoDb
  }

  type UserLoginResponse implements Response {
    status: String!
    message: String
    token: String
  }

  type UserRegisterResponse implements Response {
    status: String!
    message: String
    data: UserRegisterData
  }

  type UserFindByUsername implements Response {
    status: String!
    message: String
    data: UserFindUsernameData
  }

  type UserFindById implements Response {
    status: String!
    message: String
    data: UserFindIdData
  }

  type FollowAddNewFollow {
    status: String!
    message: String
    data: FollowAddNewData
  }

  type Post {
    _id: String!
    content: String!
    tags: [String]
    imgUrl: String
    authorId: String!
    comments: [Comments]
    likes: [Likes]
    createdAt: String
    updatedAt: String
  }
`

module.exports = {
  responseTypeDefs
}