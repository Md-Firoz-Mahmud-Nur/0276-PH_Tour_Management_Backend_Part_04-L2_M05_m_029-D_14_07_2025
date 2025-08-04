import AppError from "../../errorHelpers/AppError";
import { IsActive, IUser } from "../user/user.interface";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import { User } from "../user/user.model";
import { envVariables } from "../../config/env";
import { generateToken, verifyToken } from "../../utils/jwt";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  const isPasswordMatched = await bcrypt.compare(
    password as string,
    isUserExist.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password");
  }

  // const jwtPayload = {
  //   email: isUserExist.email,
  //   role: isUserExist.role,
  //   userId: isUserExist._id,
  // };

  // const accessToken = generateToken(
  //   jwtPayload,
  //   envVariables.JWT_ACCESS_SECRET,
  //   envVariables.JWT_ACCESS_EXPIRE
  // );

  // const refreshToken = generateToken(
  //   jwtPayload,
  //   envVariables.JWT_REFRESH_SECRET,
  //   envVariables.JWT_REFRESH_EXPIRE
  // );

  // const accessToken = Jwt.sign(jwtPayload, "secret", {
  //   expiresIn: "1d",
  // });

  const userTokens = createUserTokens(isUserExist);

  const { password: pass, ...rest } = isUserExist.toObject();

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const accessToken = await createNewAccessTokenWithRefreshToken(refreshToken);
  return {
    accessToken,
  };
};

const resetPassword = async (
  decodedToken: JwtPayload,
  password: string,
  updatePassword: string
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect Password");
  }

  user.password = await bcrypt.hash(
    updatePassword as string,
    Number(envVariables.BCRYPT_SALT_ROUND)
  );

  await user.save();

};

export const authServices = {
  credentialsLogin,
  getNewAccessToken,
  resetPassword,
};
