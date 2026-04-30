import type { HashServices } from "@core/contracts/HashServices";
import bcrypt from "bcrypt";

export class BcryptHasher implements HashServices {
  constructor(private readonly rounds = 10) {}

  hash(value: string): Promise<string> {
    return bcrypt.hash(value, this.rounds);
  }

  compare(value: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(value, hashed);
  }
}
