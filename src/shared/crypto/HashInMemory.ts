import type { Hasher } from "@core/contracts/Hasher";

export class HashInMemory implements Hasher {
  async hash(rawPassword: string): Promise<string> {
    return `hashed-${rawPassword}`;
  }
  async compare(rawPassword: string, hashedPassword: string): Promise<boolean> {
    return `hashed-${rawPassword}` === hashedPassword;
  }
}
