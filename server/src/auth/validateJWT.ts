import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

dotenv.config();

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

const isTokenValid = async (token: string): Promise<any> => {
  const kid = process.env.AUTH0_TENANT_KID;
  const key = await client.getSigningKey(kid);
  const signingKey = key.getPublicKey();

  return new Promise((resolve, reject): any => {
    jwt.verify(
      token,
      signingKey,
      {
        audience: process.env.AUTH0_CLIENT_ID,
        issuer: process.env.AUTH0_ISSUER_URL,
        algorithms: ['RS256'],
      },
      (error, decoded) => {
        if (error) {
          resolve({ status: 401, error });
        }
        if (decoded) {
          resolve({ status: 200, decoded });
        }
      }
    );
  });
};

export default isTokenValid;
