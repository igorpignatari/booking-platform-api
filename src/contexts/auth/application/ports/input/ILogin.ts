import type { Result } from "@core/result/Result";
import type { LoginRequest } from "../../DTOs/LoginDTO";
import type { LoginResponse } from "../../DTOs/LoginResponseDTO";

export interface ILogin {
  execute(login: LoginRequest): Promise<Result<LoginResponse>>;
}
