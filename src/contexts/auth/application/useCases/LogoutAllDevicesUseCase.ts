import { Result } from "@core/result/Result";
import type { LogoutAllDevicesRequest } from "../DTOs/LogoutAllDevicesDTO";
import type { ILogoutAllDevices } from "../ports/input/ILogoutAllDevices";
import type { AuthRepository } from "../ports/output/AuthRepository";

export class LogoutAllDevicesUseCase implements ILogoutAllDevices {
  constructor(private readonly authRepository: AuthRepository) {}
  async execute({ userId }: LogoutAllDevicesRequest): Promise<Result<void>> {
    const isDeletAll = await this.authRepository.revokeAllByUserId(userId);

    if (isDeletAll.isErr) {
      return Result.err(isDeletAll.error);
    }
    return Result.ok();
  }
}
