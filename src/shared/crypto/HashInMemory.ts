import type { HashServices } from "@core/contracts/HashServices";

export class HashInMemory implements HashServices {
  async hash(rawPassword: string): Promise<string> {
    return `hashed-${rawPassword}`;
  }
  async compare(rawPassword: string, hashedPassword: string): Promise<boolean> {
    return `hashed-${rawPassword}` === hashedPassword;
  }
}
