import { User } from "@contexts/users/domain/entity/User";
import type { HashServices } from "@core/contracts/HashServices";
import { Result } from "@core/result/Result";
import type { CreateUserRequest } from "../DTOs/createUserDTO";
import type { ICreateUser } from "../ports/input/ICreateUser";
import type { UserRepository } from "../ports/output/UserRespository";

export class CreateUserUseCase implements ICreateUser {
  constructor(
    private readonly repository: UserRepository,
    private readonly hasher: HashServices,
  ) {}
  async execute(request: CreateUserRequest): Promise<Result<User>> {
    const isEmailTaken = await this.repository.findByEmail(request.email);

    if (isEmailTaken.isErr) {
      return Result.err(new Error("Email already taken!"));
    }

    const user = await User.create(request, this.hasher);

    if (user.isErr) {
      return Result.err(user.error);
    }
    this.repository.create(user.value);
    return Result.ok(user.value);
  }
}
