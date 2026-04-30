import { User } from "@contexts/users/domain/entity/User";
import { UserErrors } from "@contexts/users/domain/errors/UserErrors";
import type { HashServices } from "@core/contracts/HashServices";
import { Result } from "@core/result/Result";
import type { CreateUserRequest } from "../DTOs/createUserDTO";
import type { ICreateUser } from "../ports/input/ICreateUser";
import type { UserRepository } from "../ports/output/UserRepository";

export class CreateUserUseCase implements ICreateUser {
  constructor(
    private readonly repository: UserRepository,
    private readonly hasher: HashServices,
  ) {}
  async execute(request: CreateUserRequest): Promise<Result<User>> {
    const isEmailTaken = await this.repository.findByEmail(request.email);

    if (isEmailTaken.isErr) {
      return Result.err(isEmailTaken.error);
    }

    if (isEmailTaken.value !== null) {
      return Result.err(UserErrors.USER_ALREADY_EXISTS.create("User already exists"));
    }

    const user = await User.create(request, this.hasher);

    if (user.isErr) {
      return Result.err(user.error);
    }
    const isSaved = await this.repository.create(user.value);
    if (isSaved.isErr) {
      return Result.err(isSaved.error);
    }
    return Result.ok(user.value);
  }
}
