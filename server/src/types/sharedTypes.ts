export type QueryData = {
  status: string;
  data: any;
  error?: PrismaError;
};

export type PrismaError = {
  clientVersion: string;
  meta: Record<any, unknown>;
} & Error;
