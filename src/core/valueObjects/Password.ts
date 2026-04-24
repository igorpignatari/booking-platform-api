import { SimpleText } from "@core/bases/SimpleText";
import type { HashServices } from "@core/contracts/HashServices";
import { CoreErrors } from "@core/errors/CoreErrors";
import { Result } from "@core/result/Result";

export class Password extends SimpleText {
  static async create(rawPassword: string, hasher: HashServices): Promise<Result<Password>> {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!Password.validateSimpleText(rawPassword)) {
      return Result.err(
        CoreErrors.INVALID_PASSWORD.create("Password must be at least 8 characters"),
      );
    }

    return regex.test(rawPassword)
      ? Result.ok(new Password(await hasher.hash(rawPassword)))
      : Result.err(
          CoreErrors.INVALID_PASSWORD.create(
            "Password must contain at least one number, one uppercase letter, one lowercase letter and one special character",
          ),
        );
  }

  static createFromString(hashedPassword: string): Password {
    return new Password(hashedPassword);
  }

  static async compare(
    rawPassword: string,
    hashedPassword: string,
    hasher: HashServices,
  ): Promise<boolean> {
    return hasher.compare(rawPassword, hashedPassword);
  }
}
