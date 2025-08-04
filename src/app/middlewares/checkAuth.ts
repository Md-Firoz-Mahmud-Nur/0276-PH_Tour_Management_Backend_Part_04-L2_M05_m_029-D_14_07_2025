import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { envVariables } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { IsActive } from "../modules/user/user.interface";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        throw new AppError(403, "Access token not found");
      }

      // const verifyAccessToken = jwt.verify(accessToken as string, "secret");

      const verifyAccessToken = verifyToken(
        accessToken,
        envVariables.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExist = await User.findOne({
        email: verifyAccessToken.email,
      });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
      }

      if (
        isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isActive}`
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      req.user = verifyAccessToken;

      if (!authRoles.includes((verifyAccessToken as JwtPayload).role)) {
        throw new AppError(403, "You are not an admin");
      }

      // if (
      //   (verifyAccessToken as JwtPayload).role !== Role.ADMIN &&
      //   (verifyAccessToken as JwtPayload).role !== Role.SUPER_ADMIN
      // ) {
      //   throw new AppError(403, "You are not an admin");
      // }

      next();
    } catch (error) {
      next(error);
    }
  };
