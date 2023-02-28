// NOTE this will likely need to continue to be itterated on as we encounter more and more errors and situations
// TODO
const logApolloError = (error: any): void => {
  const { graphQLErrors, networkError, clientErrors } = error;
  // networkError is either an object or null
  if (networkError !== null) {
    const networkStatus = networkError.statusCode;
    const networkErrors = networkError.result.errors;
    networkErrors.forEach((error: any) => {
      console.log(
        `APOLLO NETWORK ERROR:\n Name: ${error.extensions.code}\n  Message: ${error.message}\n Status: ${networkStatus}\n`
      );
    });
  }
  // graphQLErrors is an array of objects, with each object representing one specific error
  // there could be multiple errors in a single request (multiple mispelled fields, for example)
  if (graphQLErrors.length) {
    const graphErrors = graphQLErrors.map((error: Record<string, any>) => {
      return {
        name: error.extensions.code,
        message: error.message,
        path: error.path,
      };
    });
    if (graphErrors.length) {
      graphErrors.forEach((error: Record<string, any>) => {
        console.log(
          `APOLLO GRAPHQL ERROR:\n Name: ${error.name}\n Message: ${error.message}\n Path: ${error.path}`
        );
      });
    }
  }
};

export default logApolloError;
