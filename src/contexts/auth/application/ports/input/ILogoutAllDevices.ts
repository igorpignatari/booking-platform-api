import type { Result } from "@core/result/Result";
import type { LogoutAllDevicesRequest } from "../../DTOs/LogoutAllDevicesDTO";

export interface ILogoutAllDevices {
  execute(userId: LogoutAllDevicesRequest): Promise<Result<void>>;
}
