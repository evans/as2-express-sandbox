const http = require('http');
const { PubSub } = require('apollo-server');
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');

const pubsub = new PubSub();

const SOMETHING_CHANGED_TOPIC = 'something_changed';
pubsub.publish(SOMETHING_CHANGED_TOPIC, 'hello');
setInterval(
  () =>
    pubsub.publish(SOMETHING_CHANGED_TOPIC, {
      newMessage: new Date().toString(),
    }),
  1000,
);

const typeDefs = gql`
  type Query {
    hello: String
  }

  type Subscription {
    newMessage: String
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    hello: () => {
      return 'hiiii';
    },
  },
  Subscription: {
    newMessage: {
      subscribe: () => pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC),
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.createSubscriptionServer(httpServer);

httpServer.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
);
