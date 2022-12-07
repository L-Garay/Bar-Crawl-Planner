import { Prisma } from '@prisma/client';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime';
import { prismaClient } from '../index';

// Could eventually use this enum to more specifically generate Prisma errors in the future (and same concept could be used for Apollo and GraphQL)
// NOTE is something to worry about now or can be done later?
// type knownPrismaErrors =
//   | PrismaClientInitializationError
//   | PrismaClientKnownRequestError
//   | PrismaClientUnknownRequestError
//   | PrismaClientRustPanicError
//   | PrismaClientValidationError;

export type NewError = {
  clientVersion: string;
  meta: Record<any, unknown>;
} & Error;

const GetPrismaError = (error: any): NewError => {
  const newError: NewError = {
    name: '',
    message: '',
    clientVersion: '',
    meta: {},
  };
  // First two will be if it's from Prisma, name comes from regular Error object
  newError.name = error.code || error.errorCode || error.name;
  // Both Prisma and Error attach 'message'
  newError.message = error.message || '';
  newError.clientVersion = error.clientVersion || '';
  newError.meta = error.meta || {};
  newError.stack = error.stack;

  return newError;
};

export default GetPrismaError;
