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
import {
  GetAccountByEmail,
  GetAccountWithProfileData,
} from './prisma/querries/accountQuerries';
import { CreateProfile } from './prisma/mutations/profileMutations';
import { CreateAccount } from './prisma/mutations/accountMutations';
import {
  checkTokenExpiration,
  runTokenValidation,
} from './auth/helperFunctions';
// import { readFileSync } from 'fs';
// import path from 'path';

export const prismaClient = new PrismaClient();

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

  app.get('/healthcheck', (req, res) => {
    res.status(200).send('Healthy!');
  });

  app.get('/validate', async (req, res) => {
    // NOTE this route is used as a 'background' check so to speak, so we really don't care about specific errors or ensuring we log them in this situation
    // However, this runTokenValidation() is used elsewhere that does care about errors and logging them
    // which means that every time it's used here, it will log error messages when there is no token/the token is invalid, which creates unnecessary noise
    // TODO look into ways to prevent that if possible
    const decodedToken: any = await runTokenValidation(req);

    // Even though these are errors, we don't want to treat them like actual errors here
    if (decodedToken.noAuthorizationHeader || decodedToken.unauthorized) {
      return res.status(200).send(false);
    }

    const isValid = checkTokenExpiration(decodedToken);
    if (isValid) {
      return res.status(200).send(true);
    } else {
      return res.status(200).send(false);
    }
  });

  app.get('/authenticate', async (req, res) => {
    const decodedToken: any = await runTokenValidation(req);

    if (decodedToken.noAuthorizationHeader || decodedToken.unauthorized) {
      return res.status(400).send(null);
    }

    const email = decodedToken.decoded.email || '';
    const userData = await GetAccountWithProfileData(email);

    // Indicates that an account could not be found, but no errors occurred
    let newUser;
    if (userData.status === 'Success' && userData.data === null) {
      try {
        const {
          email_verified: verified,
          name,
          picture,
        } = decodedToken.decoded;

        const account = await CreateAccount(email, verified);

        const profile = await CreateProfile(name, picture, account.data.id);

        newUser = {
          name: profile.data.name,
          email: account.data.email,
        };

        return res.status(200).send(newUser);
      } catch (error) {
        console.error('Error trying to create account or profile', error);
        res.status(500).send(null);
      }
    }

    // Indicates that there is an error object to read
    if (userData.status === 'Failure') {
      console.error(
        'Hitting the error block of the /auth route',
        JSON.stringify(userData.data)
      );
      return res.status(500).send(null);
    }

    return res.status(200).send(userData.data);
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
    '/graphql',
    cors(corsOptions),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
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
        const user = await GetAccountByEmail(email);

        // NOTE need to clear this when user logs out
        // NOTE this may need to be handled client side see:
        // https://www.apollographql.com/docs/react/caching/advanced-topics/
        //  OR just make query against the server called like 'LogoutAndClear' that will have a specific header that we can check for, and if it is present we know to just return an empty context object ('clear it out')
        return { decodedToken: decodedToken.decoded, user };
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
