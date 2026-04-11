import { ForbiddenError, UnauthorizedError } from "@shared/errors/httpErrors";

class UserUnauthorizedError extends UnauthorizedError {
  private constructor(message: string) {
    super(message, "USER_UNAUTHORIZED");
  }

  static create(message: string): UserUnauthorizedError {
    return new UserUnauthorizedError(message);
  }
}

class UserForbiddenError extends ForbiddenError {
  private constructor(message: string) {
    super(message, "USER_FORBIDDEN");
  }

  static create(message: string): UserForbiddenError {
    return new UserForbiddenError(message);
  }
}

class UserLoginError extends UnauthorizedError {
  private constructor(message: string) {
    super(message, "USER_LOGIN_ERROR");
  }

  static create(message: string): UserLoginError {
    return new UserLoginError(message);
  }
}

export const AuthErrors = {
  USER_UNAUTHORIZED_ERROR: UserUnauthorizedError,
  USER_FORBIDDEN_ERROR: UserForbiddenError,
  USER_LOGIN_ERROR: UserLoginError,
} as const;
