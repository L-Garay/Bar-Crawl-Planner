import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { PrismaClient } from '@prisma/client';
import { auth, requiresAuth } from 'express-openid-connect';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { GetUserByEmail } from './prisma/querries/usersQuerries';
import typeDefs from './schema';
import resolvers from './resolvers';
import ValidateJWT from './validate';

export const prismaClient = new PrismaClient();

dotenv.config();

const PORT = process.env.SERVER_PORT || 4000;

// NOTE when compiled, this file is not included and therefore can never be found
// NOTE even when running the 'ts-node' command, this file supposedly still cannot be found
// const typeDefs = readFileSync('./schema.graphql', {
//   encoding: 'utf-8',
// });

async function StartServer() {
  const app = express();
  // Our httpServer handles incoming requests to our Express app.
  const httpServer = http.createServer(app);

  // Same ApolloServer initialization as before, plus the drain plugin
  // for our httpServer.
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  // Order of app.use() and app.get() matters
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

  app.get('/', (req, res) => {
    console.log('id token: ', req.oidc.idToken);
    const message = req.oidc.isAuthenticated()
      ? 'You are logged in'
      : 'You are logged out';
    res.send(message);
  });

  app.get('/healthcheck', (req, res) => {
    res.status(200).send('Healthy!');
  });

  app.get('/protected', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
  });

  // Set up our Express middleware to handle CORS, body parsing,
  // and our expressMiddleware function.
  app.use(
    '/', // fuzzy matches, will match /playground /logan etc
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
          // how to handle this case
          // would this be the situation when a user logs out/hasn't logged in yet?
          // do we need to do anything here other than just ensure that the context is empty in this situation?
          console.log('There is no authorization header');
          return {};
        }

        const token = authorizationHeader.split(' ');
        const decodedToken = await ValidateJWT(token[1]);
        if (decodedToken.error) {
          // handle error case here
          console.error(`Error validating token: ${decodedToken.error}`);
          return {};
        }

        const email = decodedToken.decoded.email || '';
        const user = await GetUserByEmail(email);

        // NOTE need to clear this when user logs out
        // NOTE see note above
        // NOTE this may need to be handled client side see:
        // https://www.apollographql.com/docs/react/caching/advanced-topics/
        return { decodedToken: decodedToken.decoded, user }; // should I store the entire decoded token, a specific property, or the undecoded token?
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
