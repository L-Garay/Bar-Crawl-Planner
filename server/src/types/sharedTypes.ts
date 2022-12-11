export type QueryData = {
  status: string;
  data: any;
};

export type PrismaError = {
  clientVersion: string;
  meta: Record<any, unknown>;
} & Error;
