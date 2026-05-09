import type { JWTServices } from "@contexts/auth/domain/contracts/JWTServices";
import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import { AuthErrors } from "@contexts/auth/domain/errors/AuthErrors";
import type { TRefreshToken } from "@contexts/auth/domain/types/TRefreshToken";
import type { UserRole } from "@contexts/auth/infra/database/types/UserRole";
import type { HashServices } from "@core/contracts/HashServices";
import { Result } from "@core/result/Result";
import { env } from "@shared/env/env";
import { parseDuration } from "@shared/utils/parseDuration";
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

    const expiresAt = new Date(Date.now() + parseDuration(env.jwtRefreshExpiresIn));

    const refreshTokenData: TRefreshToken = {
      id: crypto.randomUUID(),
      userId: isUser.value.id,
      expiresAt: expiresAt,
    };

    const refreshTokenEntity = RefreshToken.create(refreshTokenData);

    const isSave = await this.authRepository.save(refreshTokenEntity);

    if (isSave.isErr) {
      return Result.err(isSave.error);
    }

    const accessToken = this.jwtService.generateAccessToken({
      sub: isUser.value.id,
      role: isUser.value.role as UserRole,
    });

    const refreshToken = this.jwtService.generateRefreshToken({
      sub: refreshTokenEntity.userId,
      jti: refreshTokenEntity.id,
    });

    return Result.ok({ accessToken, refreshToken });
  }
}
