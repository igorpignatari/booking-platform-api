import { ValidationError } from "@shared/errors/httpErrors";

class InvalidEmailError extends ValidationError {
  private constructor(message: string) {
    super(message, "INVALID_EMAIL");
  }

  static create(message: string): InvalidEmailError {
    return new InvalidEmailError(message);
  }
}

class InvalidPasswordError extends ValidationError {
  private constructor(message: string) {
    super(message, "INVALID_PASSWORD");
  }

  static create(message: string): InvalidPasswordError {
    return new InvalidPasswordError(message);
  }
}

export const CoreErrors = {
  INVALID_EMAIL: InvalidEmailError,
  INVALID_PASSWORD: InvalidPasswordError,
} as const;
