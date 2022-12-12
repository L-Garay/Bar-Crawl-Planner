import ValidateJWT from './validateJWT';
import moment from 'moment';
import { TokenValidationResponse } from '../types/sharedTypes';

export const runTokenValidation = async (
  request: any
): Promise<TokenValidationResponse> => {
  const authorizationHeader = request.headers.authorization;
  if (!authorizationHeader) {
    console.error('There is no authorization header');
    const error: Error = {
      name: 'UNAUTHENTICATED',
      message: 'No authorization header',
    };
    return { status: 401, decoded: undefined, error };
  }

  const token = authorizationHeader.split(' ');
  const decodedToken = await ValidateJWT(token[1]);

  if (decodedToken.error) {
    console.error(`Error validating token: ${decodedToken.error.message}`);
    decodedToken.error.name = 'UNAUTHORIZED';
    return decodedToken;
  }
  return decodedToken;
};

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
  // NOTE setting the time to 0 will always force isBefore() to resolve to false
  // this will cause the user to get logged out if they are already logged in
  // or prevent them from being able to log in successfully (if their token is never updated/fixed)
  // Is this the desired behavior?
  const expirationTime = decodedToken.decoded.exp || 0;
  const now = moment();
  const expiration = moment.unix(expirationTime);
  const isValid = now.isBefore(expiration);

  return isValid;
};
