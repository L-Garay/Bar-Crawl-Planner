import { PrismaError } from '../types/sharedTypes';

// NOTE implement this when and as needed
// idea being that you could loop through this dictionary and attempt to match the incoming error to one of the known Prisma errors
// which would then allow us to tailor our error messages more if needed
// const knownPrismaErrors = {
//   initialization: PrismaClientInitializationError,
//   knownRequest: PrismaClientKnownRequestError,
//   rustPanic: PrismaClientRustPanicError,
//   unknownRequest: PrismaClientUnknownRequestError,
//   validation: PrismaClientValidationError,
// };

const GetPrismaError = (error: any): PrismaError => {
  const newError: PrismaError = {
    name: '',
    message: '',
    clientVersion: '',
    meta: {},
  };
  // First two will be if it's from Prisma, name comes from regular Error object
  newError.name = error.code || error.errorCode || error.name;
  newError.clientVersion = error.clientVersion || '';
  newError.meta = error.meta || {};
  // Both Prisma and Error attach 'message'
  newError.message = error.message || '';
  newError.stack = error.stack;

  return newError;
};

export default GetPrismaError;
