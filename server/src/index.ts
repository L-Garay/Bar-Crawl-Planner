import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import typeDefs from './schemas/schema';
import resolvers from './resolvers';
import { ApolloServer } from '@apollo/server';
import { PrismaClient } from '@prisma/client';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { GetAccountByEmail } from './prisma/querries/accountQuerries';
import {
  checkTokenExpiration,
  runTokenValidation,
} from './auth/helperFunctions';
import { testGoogleJob } from './scheduledJobs/testGoogleMaps';
import { GetProfileByAccountId } from './prisma/querries/profileQuerries';
import { DisconnectUserWithOuting } from './prisma/mutations/outingMutations';
import useAuth from './auth/authMiddleware';

const prismaClient = new PrismaClient({
  log: ['warn', 'error'],
});
export default prismaClient;

dotenv.config();

const PORT = process.env.SERVER_PORT || 4000;

// NOTE when compiled, I get a node module error, something about a syntax error and an unexpected ';' character somewhere
// HOWEVER, if I use the 'regular typeDefs' I am able to successfully compile/build the server code and then run the compiled code and able to hit the different enpoints and make gql requests
// ALTHOUGH, I'm only using one of the generated types currently, to type my resolvers object
// QUESTION, I'm assuming these types are the same/equivalent to TS types and therefore are not actually needed/used anyway once compiled?
// const generatedTypeDefs = readFileSync(
//   path.resolve(__dirname, './schemas/schema.js'),
//   {
//     encoding: 'utf-8',
//   }
// );

async function StartServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  // NOTE will likely need to expand/modify this going forward
  // this is a basic example to be able to test connection
  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
  };

  app.get('/healthcheck', (req, res) => {
    res.status(200).send('Healthy!');
  });

  app.post(
    '/disconnect-user',
    bodyParser.text(),
    // TODO testing config
    cors({ origin: 'http://localhost:3000', credentials: false }), // not sure how I feel about this, will likely need to change this after looking into cors more
    // but for right now in testing, this works
    async (req, res) => {
      const keyValArray = req.body.split('&');
      const valArray = keyValArray.map(
        (keyVal: string) => keyVal.split('=')[1]
      );

      const response = await DisconnectUserWithOuting(
        Number(valArray[0]),
        Number(valArray[1])
      );
      if (response.error) {
        return res.status(500).send(response.error);
      }
      return res.status(200).send(response.data);
    }
  );

  // this route is used as a 'background' check so to speak
  app.get('/validate', async (req, res, next) => {
    const decodedToken = await runTokenValidation(req);

    // Even though these are errors, we don't want to treat them like actual errors here
    if (decodedToken.error) {
      return res.status(200).send(false);
    }

    const isValid = checkTokenExpiration(decodedToken);
    if (isValid) {
      return res.status(200).send(true);
    } else {
      return res.status(200).send(false);
    }
  });

  // main auth route
  app.get('/authenticate', async (req, res) => {
    const decodedToken = await runTokenValidation(req);

    if (decodedToken.error) {
      console.log(
        'this means there was an error decoding token: ',
        decodedToken.error.name,
        decodedToken.error.message
      );
      return res.status(400).send(null);
    }
    if (
      typeof decodedToken.decoded === 'string' ||
      typeof decodedToken.decoded === 'undefined'
    ) {
      console.log('this means the decoded token is a string or undefined');
      return res.status(500).send(null);
    }
    return res.status(200).send('Success');
  });

  app.get(
    '/notification-machine',
    cors(corsOptions),
    bodyParser.json(),
    async (req, res) => {
      const decodedToken = await runTokenValidation(req);
      const badToken =
        decodedToken.error ||
        typeof decodedToken.decoded === 'string' ||
        typeof decodedToken.decoded === 'undefined';
      if (badToken) {
        return res.status(500).send('no auth');
      }
      console.log(
        'this means we passed auth on the notification machine route'
      );
      return res.status(200).send('Success');
    }
  );

  // Set up our Express middleware to handle CORS, body parsing,
  // and our expressMiddleware function.
  app.use(
    '/graphql',
    cors(corsOptions),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const decodedToken = await runTokenValidation(req);

        if (decodedToken.error?.name === 'UNAUTHENTICATED') {
          return {
            authError: {
              code: decodedToken.error.name,
              message: 'You are not authenticated, please log in to continue.',
            },
          };
        }

        if (decodedToken.error?.name === 'UNAUTHORIZED') {
          return {
            authError: {
              code: decodedToken.error.name,
              message: 'You do not have permission to do this.',
            },
          };
        }

        // NOTE what should be returned in this situation?
        // Should we treat it as an error?
        // When an empty object is returned, all auth based gql requests will fail (which is all of them)
        if (typeof decodedToken.decoded === 'string') return {};

        // TODO here we need to check to see if the inviteData customHeader was passed
        // if so, then we know that there is a chance this email may not match any account
        // in which case, I'm thinking we just don't set a user account or profile
        // I don't believe that there will be any issues, as once the invite flow is done the user will have claimed their account
        if (req.headers.invitedata) {
          return { decodedToken: decodedToken.decoded };
        }
        const email = decodedToken.decoded?.email;
        const user = await GetAccountByEmail(email);
        const profile = await GetProfileByAccountId(user.data.id);

        // NOTE may need to clear this when user logs out
        // https://www.apollographql.com/docs/react/caching/advanced-topics/
        return { decodedToken: decodedToken.decoded, user, profile };
      },
    })
  );
  app.set('trust proxy', true);

  // NOTE testing scheduler
  // await testGoogleJob();

  // Modified server startup
  await new Promise((resolve) =>
    httpServer.listen({ port: PORT }, () => {
      console.log(`🚀  Server ready at http://localhost:${PORT}/`);
      resolve;
    })
  );
}

StartServer();
