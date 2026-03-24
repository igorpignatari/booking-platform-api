import type { JWTServices } from "@contexts/auth/domain/contracts/JWTServices";
import type { HashServices } from "@core/contracts/HashServices";
import { Result } from "@core/result/Result";
import type { LoginRequest } from "../DTOs/LoginDTO";
import type { LoginResponse } from "../DTOs/LoginResponseDTO";
import type { ILogin } from "../ports/input/ILogin";
import type { AuthRepository } from "../ports/output/AuthRepository";
import type { AuthUserRepository } from "../ports/output/AuthUserRepository";

export class LoginUseCase implements ILogin {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: AuthUserRepository,
    private readonly jwtService: JWTServices,
    private readonly hashService: HashServices,
  ) {}

  async execute(login: LoginRequest): Promise<Result<LoginResponse>> {
    const isUser = await this.userRepository.findByEmailForAuth(login.email);
    if (isUser.isErr) {
      return Result.err(isUser.error);
    }

    if (isUser.value === null) {
      return Result.err(new Error("Invalid login"));
    }

    const isPasswordValid = await this.hashService.compare(login.password, isUser.value.password);

    if (!isPasswordValid) {
      return Result.err(new Error("Invalid login"));
    }

    const accessToken = this.jwtService.generateAccessToken({
      id: isUser.value.id,
    });
    const refreshToken = this.jwtService.generateRefreshToken({
      id: isUser.value.id,
    });

    await this.authRepository.save(refreshToken);
    return Result.ok({ accessToken, refreshToken });
  }
}
