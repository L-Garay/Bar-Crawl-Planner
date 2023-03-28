import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      auth0_username: process.env.GMAIL_EMAIL,
      auth0_password: process.env.GMAIL_PASSWORD,
      auth0_audience: process.env.AUTH0_AUDIENCE,
      auth0_client_id: process.env.AUTH0_CLIENT_ID,
      auth0_domain: process.env.AUTH0_DOMAIN,
    },
  },
});
