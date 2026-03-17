import { ValueObject } from "./ValueObject";

export abstract class SimpleText extends ValueObject<string> {
  constructor(simpleText: string) {
    super(simpleText);
  }

  protected validateSimpleText(value: string, min = 3, max = 80): boolean {
    if (value === null || value === undefined) return false;
    if (value.length < min && value.length > max) return false;
    return true;
  }
}
