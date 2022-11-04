import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

dotenv.config();

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

// const getKey = (callback: any) => {
//   const kid = process.env.AUTH0_TENANT_KID;
//   client.getSigningKey(kid, (error, key) => {
//     console.log(kid);
//     console.log(key);

//     const signingKey = key?.getPublicKey();
//     callback(null, signingKey);
//   });
// };

const isTokenValid = async (token: string): Promise<any> => {
  const bearerToken = token.split(' ');
  console.log('BEARER TOKEN', bearerToken);

  const kid = process.env.AUTH0_TENANT_KID;
  const key = await client.getSigningKey(kid);
  console.log('KEY', key);
  const signingKey = key.getPublicKey();
  console.log('SIGNING KEY', signingKey);

  try {
    const decoded = jwt.verify(bearerToken[1], signingKey);
    return { decoded };
  } catch (error) {
    return { error };
  }

  return new Promise((resolve, reject): any => {
    jwt.verify(
      bearerToken[1],
      signingKey,
      {
        audience: process.env.AUTH0_CLIENT_ID,
        issuer: process.env.AUTH0_ISSUER_URL,
        algorithms: ['RS256'],
      },
      (error, decoded) => {
        if (error) {
          resolve({ error });
        }
        if (decoded) {
          resolve({ decoded });
        }
      }
    );
  });
  // return result;
};

export default isTokenValid;
