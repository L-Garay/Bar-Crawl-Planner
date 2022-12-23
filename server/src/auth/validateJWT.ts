import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { TokenValidationResponse } from '../types/sharedTypes';

dotenv.config();

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

// NOTE should we have two seperate validation functions?
// one for the id token and one for the access token?
const isTokenValid = async (
  token: string
): Promise<TokenValidationResponse> => {
  const kid = process.env.AUTH0_TENANT_KID;
  const key = await client.getSigningKey(kid);
  const signingKey = key.getPublicKey();

  const audiences = [
    process.env.AUTH0_CLIENT_ID,
    process.env.AUTH0_API,
    `${process.env.AUTH0_ISSUER_URL}/userinfo`,
  ] as string[];

  return new Promise((resolve, reject): any => {
    jwt.verify(
      token,
      signingKey,
      {
        audience: audiences,
        issuer: `${process.env.AUTH0_ISSUER_URL}/`,
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
