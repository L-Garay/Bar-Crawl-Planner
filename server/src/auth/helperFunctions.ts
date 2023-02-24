import ValidateJWT from './validateJWT';
import moment from 'moment';
import { TokenValidationResponse } from '../types/sharedTypes';

// This is used on every request coming into the server
export const runTokenValidation = async (
  request: any
): Promise<TokenValidationResponse> => {
  const authorizationHeader = request.headers.authorization;
  if (!authorizationHeader) {
    const error: Error = {
      name: 'UNAUTHENTICATED',
      message: 'No authorization header',
    };
    return { status: 401, decoded: undefined, error };
  }

  const token = authorizationHeader.split(' ');
  const decodedToken = await ValidateJWT(token[1]);

  if (decodedToken.error) {
    decodedToken.error.name = 'UNAUTHORIZED';
    return decodedToken;
  }
  return decodedToken;
};

// This is used to check returning/already logged in users, and ensure their token hasn't expired since their last visit/interaction
export const checkTokenExpiration = (
  decodedToken: TokenValidationResponse
): boolean => {
  if (
    typeof decodedToken.decoded === 'string' ||
    typeof decodedToken.decoded === 'undefined'
  ) {
    return false;
  }
  // TODO need to figure out how to handle the decodedToken being a string

  // Setting the time to 0 will always force isBefore() to resolve to false
  // this will cause the user to get logged out if they present either an expired/invalid/no token
  const expirationTime = decodedToken.decoded.exp || 0;
  const now = moment();
  const expiration = moment.unix(expirationTime);
  const isValid = now.isBefore(expiration);

  return isValid;
};
