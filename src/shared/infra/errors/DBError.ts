import { UnexpectedError } from "@shared/errors/UnexpectedError";

export class DBError extends UnexpectedError {
  private constructor(message: string) {
    super(message, "DB_ERROR");
  }
  public static create(message: string) {
    return new DBError(message);
  }
}
