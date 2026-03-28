import type { Result } from "@core/result/Result";
import type { AuthResponse } from "../../DTOs/AuthResponseDTO";
import type { LoginRequest } from "../../DTOs/LoginDTO";

export interface ILogin {
  execute(login: LoginRequest): Promise<Result<AuthResponse>>;
}
