import type { HashServices } from "@core/contracts/HashServices";
import { Result } from "@core/result/Result";
import { Email } from "@core/valueObjects/Email";
import { Password } from "@core/valueObjects/Password";
import { AggregatedValidationError } from "@shared/domain/errors/AggregatedValidationError";
import type { TCreateUser } from "../types/TCreateUser";
import type { TPersistedUser } from "../types/TPersistedUser";
import { Role } from "../valueObjects/Role";

export class User {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly email: Email,
    readonly password: Password,
    readonly phone: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly role: Role,
  ) {}

  public static async create(
    rawUser: TCreateUser,
    hasher: HashServices,
  ): Promise<Result<User, AggregatedValidationError>> {
    const password = await Password.create(rawUser.password, hasher);
    const email = Email.create(rawUser.email);
    const role = Role.create("user");

    return Result.combine([email, password, role])
      .mapError((errors) => new AggregatedValidationError(errors))
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
            role.value,
          ),
      );
  }

  public static createFromPersisted(persistentUser: TPersistedUser): User {
    return new User(
      persistentUser.id,
      persistentUser.name,
      Email.createFromPersisted(persistentUser.email),
      Password.createFromPersisted(persistentUser.password),
      persistentUser.phone,
      persistentUser.createdAt,
      persistentUser.updatedAt,
      Role.createFromPersisted(persistentUser.role),
    );
  }
}
