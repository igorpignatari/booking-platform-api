import type { Result } from "@core/result/Result";
import type { LogoutRequest } from "../../DTOs/LogoutDTO";

export interface ILogout {
  execute(jit: LogoutRequest): Promise<Result<void>>;
}
