import { ConflictError, NotFoundError, ValidationError } from "@shared/errors/httpErrors";

class UserNotFoundError extends NotFoundError {
  private constructor(message: string) {
    super(message, "USER_NOT_FOUND");
  }

  static create(message: string): UserNotFoundError {
    return new UserNotFoundError(message);
  }
}

class UserAlreadyExistsError extends ConflictError {
  private constructor(message: string) {
    super(message, "USER_ALREADY_EXISTS");
  }

  static create(message: string): UserAlreadyExistsError {
    return new UserAlreadyExistsError(message);
  }
}

class RoleInvalidError extends ValidationError {
  private constructor(message: string) {
    super(message, "ROLE_INVALID");
  }

  static create(message: string): RoleInvalidError {
    return new RoleInvalidError(message);
  }
}

export const UserErrors = {
  USER_NOT_FOUND: UserNotFoundError,
  USER_ALREADY_EXISTS: UserAlreadyExistsError,
  ROLE_INVALID: RoleInvalidError,
} as const;
