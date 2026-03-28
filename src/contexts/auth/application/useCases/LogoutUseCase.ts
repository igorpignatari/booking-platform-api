import { Result } from "@core/result/Result";
import type { RefreshTokenRequest } from "../DTOs/RefreshTokenDTO";
import type { ILogout } from "../ports/input/ILogout";
import type { AuthRepository } from "../ports/output/AuthRepository";

export class LogoutUseCase implements ILogout {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute({ refreshToken }: RefreshTokenRequest): Promise<Result<void>> {
    const isDeleted = await this.authRepository.delete(refreshToken);
    if (isDeleted.isErr) {
      return Result.err(isDeleted.error);
    }
    return Promise.resolve(Result.ok(undefined));
  }
}
