import jwt from 'jsonwebtoken';

export type QueryData = {
  status: string;
  data: any;
  error?: PrismaError;
};

export type PrismaError = {
  clientVersion: string;
  meta: Record<any, unknown>;
} & Error;

export type TokenValidationResponse = {
  status: number;
  error?: jwt.VerifyErrors | Error;
  decoded?: jwt.JwtPayload | string;
};
