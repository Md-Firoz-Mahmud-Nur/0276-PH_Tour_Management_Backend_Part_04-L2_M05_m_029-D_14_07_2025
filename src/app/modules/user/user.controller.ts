import { NextFunction, request, response } from "express";
import httpStatus from "http-status-codes";
import { userService } from "./user.service";
import AppError from "../../errorHelpers/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { verifyToken } from "../../utils/jwt";
import { envVariables } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  // res
  //   .status(httpStatus.CREATED)
  //   .json({ message: "User created successfully", user });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Created Successfully",
    data: user,
  });
});

// const createUser = async (
//   req = request,
//   res = response,
//   next: NextFunction
// ) => {
//   try {
//     // throw new Error("Fake Error");
//     // throw new AppError(httpStatus.BAD_REQUEST, "Fake Error");

//     const user = await userService.createUser(req.body);

//     res
//       .status(httpStatus.CREATED)
//       .json({ message: "User created successfully", user });
//   } catch (error) {
//     console.log(error);
//     // res
//     //   .status(httpStatus.INTERNAL_SERVER_ERROR)
//     //   .json({ message: `Something went wrong ${error} from user controller`, error });
//     next(error);
//   }
// };

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(
    //   token as string,
    //   envVariables.JWT_ACCESS_SECRET
    // ) as JwtPayload;

    const verifiedToken = req.user as JwtPayload;

    const payload = req.body;
    const user = await userService.updateUser(userId, payload, verifiedToken);

    // res.status(httpStatus.CREATED).json({
    //     message: "User Created Successfully",
    //     user
    // })

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Updated Successfully",
      data: user,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.getAllUsers();

    // res.status(httpStatus.OK).json({
    //   success: true,
    //   message: "All Users Retrieved Successfully",
    //   data: result,
    // });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Users Retrieved Successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

// const getAllUsers = async (
//   req = request,
//   res = response,
//   next: NextFunction
// ) => {
//   try {
//     const users = await userService.getAllUsers();
//     res.status(httpStatus.OK).json({ users });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };

export const userControllers = {
  createUser,
  getAllUsers,
  updateUser,
};
