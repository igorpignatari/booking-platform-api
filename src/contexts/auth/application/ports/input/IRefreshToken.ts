import type { Result } from "@core/result/Result";
import type { AuthResponse } from "../../DTOs/AuthResponseDTO";
import type { RefreshTokenRequest } from "../../DTOs/RefreshTokenDTO";

export interface IRefreshToken {
  execute(refreshToken: RefreshTokenRequest): Promise<Result<AuthResponse>>;
}
