import type { JWTServices } from "@contexts/auth/domain/contracts/JWTServices";
import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import { AuthErrors } from "@contexts/auth/domain/errors/AuthErrors";
import type { TRefreshToken } from "@contexts/auth/domain/types/TRefreshToken";
import type { HashServices } from "@core/contracts/HashServices";
import { Result } from "@core/result/Result";
import { env } from "@shared/env/env";
import type { AuthResponse } from "../DTOs/AuthResponseDTO";
import type { LoginRequest } from "../DTOs/LoginDTO";
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

  async execute(login: LoginRequest): Promise<Result<AuthResponse>> {
    const isUser = await this.userRepository.findByEmailForAuth(login.email);
    if (isUser.isErr) {
      return Result.err(isUser.error);
    }

    if (isUser.value === null) {
      return Result.err(AuthErrors.USER_LOGIN_ERROR.create("Email or password is invalid"));
    }

    const isPasswordValid = await this.hashService.compare(login.password, isUser.value.password);

    if (!isPasswordValid) {
      return Result.err(AuthErrors.USER_LOGIN_ERROR.create("Email or password is invalid"));
    }

    const accessToken = this.jwtService.generateAccessToken({
      id: isUser.value.id,
    });

    const refreshTokenData: TRefreshToken = {
      userId: isUser.value.id,
      token: this.jwtService.generateRefreshToken({
        id: isUser.value.id,
      }),
      expiresInDays: Number(env.jwtRefreshExpiresIn.split("")[0]),
    };

    const refreshToken = RefreshToken.create(refreshTokenData);

    const isSave = await this.authRepository.save(refreshToken);

    if (isSave.isErr) {
      return Result.err(isSave.error);
    }
    return Result.ok({ accessToken, refreshToken: refreshToken.token });
  }
}
