import { ApolloServer } from '@apollo/server';
import resolvers from './resolvers';
import { PrismaClient } from '@prisma/client';
// import { readFileSync } from 'fs';
import typeDefs from './schema';
import { auth, requiresAuth } from 'express-openid-connect';
import path from 'path';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
require('dotenv').config();

export const prismaClient = new PrismaClient();

// NOTE when compiled, this file is not included and therefore can never be found
// NOTE even when running the 'ts-node' command, this file supposedly still cannot be found
// const typeDefs = readFileSync('./schema.graphql', {
//   encoding: 'utf-8',
// });

async function StartServer() {
  // Required logic for integrating with Express
  const app = express();
  // Our httpServer handles incoming requests to our Express app.
  // Below, we tell Apollo Server to "drain" this httpServer,
  // enabling our servers to shut down gracefully.
  const httpServer = http.createServer(app);

  // Same ApolloServer initialization as before, plus the drain plugin
  // for our httpServer.
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  // Ensure we wait for our server to start
  await server.start();

  // Set up our Express middleware to handle CORS, body parsing,
  // and our expressMiddleware function.
  app.use('/playground', cors(), bodyParser.json(), expressMiddleware(server));
  console.log(process.env.BASE_URL);
  app.use(
    auth({
      issuerBaseURL: process.env.AUTH0_ISSUER_URL,
      baseURL: process.env.BASE_URL,
      clientID: process.env.AUTH_CLIENT_ID,
      secret: process.env.SESSION_SECRET,
      authRequired: false,
      auth0Logout: true,
    })
  );

  app.get('/', (req, res) => {
    const message = req.oidc.isAuthenticated()
      ? `Hello ${req.oidc.user?.name}, you have sucessfully logged in!`
      : 'You are logged out.';
    res.send(message);
  });

  app.get('/protected', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
  });

  app.set('trust proxy', true);

  const port = process.env.SERVER_PORT || 4000;
  // Modified server startup
  await new Promise((resolve) =>
    httpServer.listen({ port: port }, () => resolve)
  );
  console.log(`🚀  Server ready at http://localhost:${port}/`);
}

StartServer();
