import {
  TErrorSources,
  TGenericErrorResponse,
} from "../interfaces/error.types";

export const handlerZodError = (err: any): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [];

  err.issues.forEach((error: any) => {
    errorSources.push({
      // path: error.path[error.path.length - 1],
      path: error.path.length > 1 && error.path.reverse().join(" inside "),
      message: error.message,
    });
  });

  return {
    statusCode: 400,
    message: "Zod Error",
    errorSources,
  };
};
