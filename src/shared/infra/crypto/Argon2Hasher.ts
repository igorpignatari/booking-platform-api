import type { HashServices } from "@core/contracts/HashServices";
import argon2 from "argon2";

export class Argon2Hasher implements HashServices {
  hash(value: string): Promise<string> {
    return argon2.hash(value, {
      type: argon2.argon2id,
      memoryCost: 19456, // 19 MB
      timeCost: 2,
      parallelism: 1,
    });
  }
  compare(hashed: string, value: string): Promise<boolean> {
    return argon2.verify(hashed, value);
  }
}
