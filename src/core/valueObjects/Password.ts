import { SimpleText } from "@core/bases/SimpleText";
import type { Hasher } from "@core/contracts/Hasher";
import { Result } from "@core/result/Result";

export class Password extends SimpleText {
  constructor(hashedPassword: string) {
    super(hashedPassword);
  }

  static async create(rawPassword: string, hasher: Hasher): Promise<Result<Password>> {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!Password.validateSimpleText(rawPassword)) {
      return Result.err(new Error("Invalid password"));
    }

    return regex.test(rawPassword)
      ? Result.ok(new Password(await hasher.hash(rawPassword)))
      : Result.err(new Error("Invalid password"));
  }

  static createFromString(hashedPassword: string): Password {
    return new Password(hashedPassword);
  }

  static async compare(
    rawPassword: string,
    hashedPassword: string,
    hasher: Hasher,
  ): Promise<boolean> {
    return hasher.compare(rawPassword, hashedPassword);
  }
}
