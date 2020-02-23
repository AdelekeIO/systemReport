const { ApolloServer, gql } = require("apollo-server");
// const { ApolloServer, gql } = require("apollo-server-lambda");
const Conn = require("./config/db");
const User = require("./models/User");
const resolvers = require("./resolvers/resolvers");
const UserDB = require("./datasource/User");
const InstallationDB = require("./datasource/Installation");
const OnlineReport = require("./datasource/onlineReport");
const OwnerDB = require("./datasource/Owner");
const DeviceDB = require("./datasource/Device");
const typeDefs = require("./schema/shema");
const axios = require("axios");
// const Performance = require("sequelize");
// const Op = Sequelize.Op;

// Connection
// Conn.authenticate()
//   .then(() => {
//     console.log("Connection has been established successfully.");
//   })
//   .catch(err => {
//     console.error("Unable to connect to the database:", err);
//   });

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    UserDB: new UserDB(),
    InstallationDB: new InstallationDB(),
    DeviceDB: new DeviceDB(),
    OwnerDB: new OwnerDB(),
    OnlineReport: new OnlineReport()
    // userAPI: new UserAPI({ store })
  })
});

// export function

// exports.iotGraph = server.createHandler();

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

// Lambda Deployment
// exports.graphqlHandler = server.createHandler({
//   cors: {
//     origin: "*",
//     credentials: true
//   }
// });
