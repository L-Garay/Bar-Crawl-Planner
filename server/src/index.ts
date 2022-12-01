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
import { GetAccountByEmail } from './prisma/querries/accountQuerries';
import typeDefs from './schema';
import resolvers from './resolvers';
import ValidateJWT from './auth/validateJWT';
import { runTokenValidation } from './auth/helperFunctions';

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

  // NOTE will not be using this
  app.get('/authenticate', async (req, res) => {
    console.log('Hitting the authenticate route in server', req.path);
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      // TODO need to send proper response
      return res.status(400);
    }

    const token = authorizationHeader.split(' ');
    const decodedToken = await ValidateJWT(token[1]);
    // get user
    // set user
    return res.status(200).send(JSON.stringify({ foo: 'barbarbar' }));
  });

  // NOTE will likely need to expand/modify this going forward
  // this is a basic example to be able to test connection
  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
  };

  // Set up our Express middleware to handle CORS, body parsing,
  // and our expressMiddleware function.
  app.use(
    '/playground', // fuzzy matches, will match /playground /logan etc
    cors(corsOptions),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        console.log('Is the apollo context getting hit?');
        const decodedToken = await runTokenValidation(req);

        if (decodedToken.noAuthorizationHeader) {
          return {
            authError: {
              code: 'UNAUTHENTICATED',
              message: 'You are not authenticated, please log in to continue.',
            },
          };
        }

        if (decodedToken.unauthorized) {
          return {
            authError: {
              code: 'UNAUTHORIZED',
              message: 'You do not have permission to do this.',
            },
          };
        }

        const email = decodedToken.decoded.email || '';
        // TODO still need to handle the case where a user signs up to the site for the first time and so there won't a user in the DB to find
        const user = await GetAccountByEmail(email);
        console.log('Found user in apollo context:', user);

        // NOTE need to clear this when user logs out
        // NOTE see note above
        // NOTE this may need to be handled client side see:
        // https://www.apollographql.com/docs/react/caching/advanced-topics/
        //  OR just make query against the server called like 'LogoutAndClear' that will have a specific header that we can check for, and if it is present we know to just return an empty context object ('clear it out')
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
