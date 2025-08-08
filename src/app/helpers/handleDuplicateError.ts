import { TGenericErrorResponse } from "../interfaces/error.types";

export const handlerDuplicateError = (err: any): TGenericErrorResponse => {
  return {
    statusCode: 409,
    message: `${Object.values(err.keyValue)} already exists`,
    // message = `Duplicate ${Object.keys(err.keyValue)} entered, ${Object.values(err.keyValue)} already exists`,
  };
};
