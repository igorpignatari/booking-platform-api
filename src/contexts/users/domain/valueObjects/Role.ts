import { ValueObject } from "@core/bases/ValueObject";
import { Result } from "@core/result/Result";
import { UserErrors } from "../errors/UserErrors";

export const Roles = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type Roles = (typeof Roles)[keyof typeof Roles];

const validRoles = new Set(Object.values(Roles));

export class Role extends ValueObject<Roles> {
  static create(value: string): Result<Role> {
    if (!Role.isValid(value)) {
      return Result.err(UserErrors.ROLE_INVALID.create(`Invalid role: ${value}`));
    }
    return Result.ok(new Role(value as Roles));
  }

  static createFromKey(key: string): Result<Role> {
    if (!(key in Roles)) {
      return Result.err(UserErrors.ROLE_INVALID.create(`Invalid role: ${key}`));
    }

    const value = Roles[key as keyof typeof Roles];
    return Result.ok(new Role(value));
  }

  static createFromPersisted(value: string): Role {
    return new Role(value as Roles);
  }

  private static isValid(value: string): value is Roles {
    return validRoles.has(value as Roles);
  }
}
