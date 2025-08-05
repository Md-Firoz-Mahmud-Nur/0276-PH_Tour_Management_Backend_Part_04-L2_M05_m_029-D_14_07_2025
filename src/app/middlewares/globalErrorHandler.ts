import { NextFunction, Request, Response } from "express";
import { envVariables } from "../config/env";
import AppError from "../errorHelpers/AppError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);

  let errorSources: any = [
    // {
    //   path: "isDeleted",
    //   message: "Cast Failed",
    // },
  ];
  let statusCode = 500;
  let message = `Something went wrong ${err.message} from global middleware`;
  if (err.code === 11000) {
    statusCode = 409;
    // message = `Duplicate ${Object.keys(err.keyValue)} entered, ${Object.values(err.keyValue)} already exists`;
    message = `${Object.values(err.keyValue)} already exists`;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID, Please Provide A Valid ID";
  } else if (err.name === "ZodError") {
    statusCode = 400;
    const errors = err.issues;
    console.log("errors", errors);
    errors.forEach((error: any) =>
      errorSources.push({
        path: error.path[0],
        message: error.message,
      })
    );
    message = "Validation Error";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors);
    errors.forEach((error: any) =>
      errorSources.push({
        path: error.path,
        message: error.message,
      })
    );
    message = "Validation Error";
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    err,
    errorSources,
    stack: envVariables.NODE_ENV === "development" ? err.stack : null,
  });
};
