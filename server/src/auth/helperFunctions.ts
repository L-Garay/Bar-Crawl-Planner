import ValidateJWT from './validateJWT';
import moment from 'moment';

export const runTokenValidation = async (request: any) => {
  const authorizationHeader = request.headers.authorization;
  if (!authorizationHeader) {
    // how to handle this case
    // would this be the situation when a user logs out/hasn't logged in yet?
    // do we need to do anything here other than just ensure that the context is empty in this situation?
    console.error('There is no authorization header');
    return { noAuthorizationHeader: true };
  }

  const token = authorizationHeader.split(' ');
  const decodedToken = await ValidateJWT(token[1]);

  if (decodedToken.error) {
    console.error(`Error validating token: ${decodedToken.error.message}`);
    // NOTE given that in this code block we'll be fairly confident that if there is an error it has to do with the JWT
    // should we be more specific in our message that we send back to the client in this case?
    // the returned strings below will be used to construct the GraphQLError in the resolvers
    // which is then what will get returned by said resolver to the client
    // Maybe we don't send the client anything specific at this point but we/they kick off side effects that once resolved can print/say/do more specific things (fill out a help form, reset password, follow debug steps etc)
    return { unauthorized: true };
  }
  return decodedToken;
};

export const checkTokenExpiration = (decodedToken: any): boolean => {
  const expirationTime = decodedToken.decoded.exp;
  const now = moment();
  const expiration = moment.unix(expirationTime);
  const isValid = now.isBefore(expiration);
  return isValid;
};
