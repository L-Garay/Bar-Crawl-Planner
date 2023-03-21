import { NextFunction, Request, Response } from 'express';
import { VerifyErrors } from 'jsonwebtoken';
import { TokenValidationResponse } from '../types/sharedTypes';
import { runTokenValidation } from './helperFunctions';

type AuthData = {
  type?: 'error' | 'undefined';
  error?: VerifyErrors | Error;
  decodedToken?: TokenValidationResponse;
};

const useAuth = async (req: Request): Promise<AuthData> => {
  console.log('we are in the auth middleware');
  const decodedToken = await runTokenValidation(req);
  if (decodedToken.error) {
    return { type: 'error', error: decodedToken.error };
  }
  if (
    typeof decodedToken.decoded === 'string' ||
    typeof decodedToken.decoded === 'undefined'
  ) {
    return {
      type: 'undefined',
      error: decodedToken.error,
    };
  }
  return decodedToken;
};

export default useAuth;
