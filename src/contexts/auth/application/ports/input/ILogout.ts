import type { Result } from "@core/result/Result";
import type { RefreshTokenRequest } from "../../DTOs/RefreshTokenDTO";

export interface ILogout {
  execute(refreshToken: RefreshTokenRequest): Promise<Result<void>>;
}
