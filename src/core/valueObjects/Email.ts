import { SimpleText } from "@core/bases/SimpleText";
import { Result } from "@core/result/Result";

export class Email extends SimpleText {
  private constructor(email: string) {
    super(email);
  }

  static create(email: string): Result<Email> {
    const regex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/i;

    if (!Email.validateSimpleText(email)) {
      return Result.err(new Error("Invalid email"));
    }
    return regex.test(email) ? Result.ok(new Email(email)) : Result.err(new Error("Invalid email"));
  }

  static createFromString(email: string): Email {
    return new Email(email);
  }
}
