import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { TokenValidationResponse } from '../types/sharedTypes';

dotenv.config();

// client to access JSON Web Key Set (JWKS) endpoint
// which is used to sign all auth0 issued jwts signed with RS256
// RS256 good (asymmetirc), HS256 bad (symmetric)
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
      // since we provide this asynchronous callback, the jwt.verify function will never return a string
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
