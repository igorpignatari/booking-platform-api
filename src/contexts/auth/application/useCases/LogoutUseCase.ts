import { Result } from "@core/result/Result";
import type { LogoutRequest } from "../DTOs/LogoutDTO";
import type { ILogout } from "../ports/input/ILogout";
import type { AuthRepository } from "../ports/output/AuthRepository";

export class LogoutUseCase implements ILogout {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute({ jti }: LogoutRequest): Promise<Result<void>> {
    const isRevoked = await this.authRepository.revoke(jti);

    if (isRevoked.isErr) {
      return Result.err(isRevoked.error);
    }

    return Result.ok();
  }
}
