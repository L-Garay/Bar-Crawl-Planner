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
import { GetUserByEmail } from './prisma/querries/usersQuerries';
require('dotenv').config();
import ValidateJWT from './validate';
import dotenv from 'dotenv';

export const prismaClient = new PrismaClient();

dotenv.config();

const PORT = process.env.SERVER_PORT || 4000;

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

  // NOTE order of app.use() and app.get() matters
  app.use(
    auth({
      issuerBaseURL: process.env.AUTH0_ISSUER_URL,
      baseURL: process.env.BASE_URL,
      clientID: process.env.AUTH0_CLIENT_ID,
      secret: process.env.SESSION_SECRET,
      authRequired: false,
      auth0Logout: true,
    })
  );

  // Set up our Express middleware to handle CORS, body parsing,
  // and our expressMiddleware function.

  app.get('/', (req, res) => {
    console.log(req.oidc.idToken);
    const message = req.oidc.isAuthenticated()
      ? 'You are logged in'
      : 'You are logged out';
    res.send(message);
  });

  app.get('/protected', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
  });

  app.use(
    '/', // fuzzy matches, will match /playground /logan etc
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // NOTE that this will be in the format of a JWT
        // Will need to ensure it is signed with my auth0 private key

        console.log('Headers authorization', req.headers.authorization);

        const authorizationHeader = req.headers.authorization || '';
        const decodedToken = await ValidateJWT(authorizationHeader);
        if (decodedToken.error) {
          // handle error case here
          console.error(`Error validating token: ${decodedToken.error}`);
        }
        console.log('Decoded token', decodedToken);
        // const email = req.oidc?.user ? req.oidc?.user.email : '';
        // const user = await GetUserByEmail(email);
        return { test: 'test' };
      },
    })
  );
  app.set('trust proxy', true);

  // Modified server startup
  await new Promise((resolve) =>
    httpServer.listen({ port: PORT }, () => {
      console.log(`🚀  Server ready at http://localhost:${PORT}/`);
      resolve;
    })
  );
}

StartServer();
