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

  let statusCode = 500;
  let message = `Something went wrong ${err.message} from global middleware`;
  if (err.code === 11000) {
    statusCode = 409;
    // message = `Duplicate ${Object.keys(err.keyValue)} entered, ${Object.values(err.keyValue)} already exists`;
    message = `${Object.values(err.keyValue)} already exists`;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID, Please Provide A Valid ID";
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
    stack: envVariables.NODE_ENV === "development" ? err.stack : null,
  });
};
