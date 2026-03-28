import { Result } from "@core/result/Result";
import type { LogoutRequest } from "../DTOs/LogoutDTO";
import type { ILogoutAllDevices } from "../ports/input/ILogutAllDevices";
import type { AuthRepository } from "../ports/output/AuthRepository";

export class LogoutAllDevicesUseCase implements ILogoutAllDevices {
  constructor(private readonly authRepository: AuthRepository) {}
  async execute({ userId }: LogoutRequest): Promise<Result<void>> {
    const isDeletAll = await this.authRepository.deleteAllByUserId(userId);

    if (isDeletAll.isErr) {
      return Result.err(isDeletAll.error);
    }
    return Promise.resolve(Result.ok(undefined));
  }
}
