if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require('@apollo/server/standalone')

const { responseTypeDefs } = require('./schemas/response')
const { userTypeDefs, userResolvers } = require('./schemas/user')
const { postTypeDefs, postResolver } = require('./schemas/post')
const { followResolvers, followTypeDefs } = require('./schemas/follow')

const authentication = require('./utils/authentication')

const { connectMongo } = require('./config/config')

const PORT = 4000

const server = new ApolloServer({
  typeDefs: [responseTypeDefs, userTypeDefs, postTypeDefs, followTypeDefs],
  resolvers: [userResolvers, postResolver, followResolvers]
});

(async () => {

  await connectMongo()
  console.log('Establishing connection with the server...');

  const { url } = await startStandaloneServer(server, {
    listen: {
      port: PORT
    },
    context: async ({ req, res }) => {
      console.log("This console has been triggered by a request");

      return {
        async authentication() {
          const authData = await authentication(req)
          return authData
        },
      };
    }
  });
  console.log(`🚀 Server ready at: ${url}`);
})();