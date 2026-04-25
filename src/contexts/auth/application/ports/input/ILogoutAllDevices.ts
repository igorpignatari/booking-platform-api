import type { Result } from "@core/result/Result";
import type { LogoutRequest } from "../../DTOs/LogoutDTO";

export interface ILogoutAllDevices {
  execute(userId: LogoutRequest): Promise<Result<void>>;
}
