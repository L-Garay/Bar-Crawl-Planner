import type { Auth0Client } from '@auth0/auth0-spa-js';
import { createAuth0Client } from '@auth0/auth0-spa-js';

let _auth0Client: Auth0Client;

const createClient = async (authConfig: Record<string, string>) => {
  if (_auth0Client) return _auth0Client;
  _auth0Client = await createAuth0Client({
    domain: authConfig.DOMAIN,
    clientId: authConfig.CLIENT_ID,
  });
  return _auth0Client;
};

export default async function getAuth0Client(
  config: Record<string, Record<string, string>>
) {
  const client = await createClient(config.AUTH0);
  return client;
}
