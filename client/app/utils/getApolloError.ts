// NOTE this will likely need to continue to be itterated on as we encounter more and more errors and situations
// TODO
const logApolloError = (error: any): void => {
  const { graphQLErrors, networkError, clientErrors } = error;
  const status = networkError.statusCode;
  const errors = networkError.result.errors;

  errors.forEach((error: any) => {
    console.log(
      `APOLLO ERROR:\n Status: ${status}\n Name: ${error.extensions.code}\n Message: ${error.message}`
    );
  });
};

export default logApolloError;
