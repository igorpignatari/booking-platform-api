import type { HashServices } from "@core/contracts/HashServices";
import type { BaseError } from "@core/errors/BaseError";
import { Result } from "@core/result/Result";
import { Email } from "@core/valueObjects/Email";
import { Password } from "@core/valueObjects/Password";
import type { TCreateUser } from "../types/TCreateUser";
import type { TPersistedUser } from "../types/TPersistedUser";
import type { Role } from "../valueObjects/Role";

export class User {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly email: Email,
    readonly password: Password,
    readonly phone: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly role: Role = "user",
  ) {}

  public static async create(
    rawUser: TCreateUser,
    hasher: HashServices,
  ): Promise<Result<User, BaseError[]>> {
    const password = await Password.create(rawUser.password, hasher);
    const email = Email.create(rawUser.email);

    return Result.combine([email, password])
      .map(
        () =>
          new User(
            crypto.randomUUID(),
            rawUser.name,
            email.value,
            password.value,
            rawUser.phone,
            new Date(),
            new Date(),
          ),
      )
      .map((user) => user);
  }
  public static createFromPersisted(persistentUser: TPersistedUser): User {
    return new User(
      persistentUser.id,
      persistentUser.name,
      Email.createFromString(persistentUser.email),
      Password.createFromString(persistentUser.password),
      persistentUser.phone,
      persistentUser.createdAt,
      persistentUser.updatedAt,
      persistentUser.role,
    );
  }
}
