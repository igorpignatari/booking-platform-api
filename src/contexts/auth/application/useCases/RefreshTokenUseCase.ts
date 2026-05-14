import type { JWTServices } from "@contexts/auth/domain/contracts/JWTServices";
import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import { AuthErrors } from "@contexts/auth/domain/errors/AuthErrors";
import type { TRefreshToken } from "@contexts/auth/domain/types/TRefreshToken";
import type { UserRole } from "@contexts/auth/infra/database/types/UserRole";
import { Result } from "@core/result/Result";
import { tryCatch } from "@core/tryCatch/tryCatch";
import { env } from "@shared/env/env";
import { parseDuration } from "@shared/utils/parseDuration";
import type { AuthResponse } from "../DTOs/AuthResponseDTO";
import type { RefreshTokenRequest } from "../DTOs/RefreshTokenDTO";
import type { IRefreshToken } from "../ports/input/IRefreshToken";
import type { AuthRepository } from "../ports/output/AuthRepository";
import type { AuthUserRepository } from "../ports/output/AuthUserRepository";

export class RefreshTokenUseCase implements IRefreshToken {
  constructor(
    private readonly authUserRepository: AuthUserRepository,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JWTServices,
  ) {}

  async execute({ refreshToken }: RefreshTokenRequest): Promise<Result<AuthResponse>> {
    const payload = tryCatch(
      () => this.jwtService.verifyRefreshToken(refreshToken),
      (_error) => AuthErrors.USER_UNAUTHORIZED_ERROR.create("Token is invalid"),
    );

    if (payload.isErr) {
      return Result.err(payload.error);
    }

    const token = await this.authRepository.findByJti(payload.value.jti);

    if (token.isErr) {
      return Result.err(token.error);
    }

    if (token.value === null) {
      return Result.err(AuthErrors.USER_UNAUTHORIZED_ERROR.create("Token is invalid"));
    }

    if (token.value.isExpired()) {
      return Result.err(AuthErrors.USER_UNAUTHORIZED_ERROR.create("Token is expired"));
    }

    if (token.value.revokedAt !== null) {
      return Result.err(AuthErrors.USER_UNAUTHORIZED_ERROR.create("Token is revoked"));
    }

    const user = await this.authUserRepository.findByUserIdForAuth(payload.value.sub);

    if (user.isErr) {
      return Result.err(user.error);
    }

    if (user.value === null) {
      return Result.err(AuthErrors.USER_UNAUTHORIZED_ERROR.create("User not found"));
    }

    const isRevoked = await this.authRepository.revoke(payload.value.jti);

    if (isRevoked.isErr) {
      return Result.err(isRevoked.error);
    }

    const expiresAt = new Date(Date.now() + parseDuration(env.jwtRefreshExpiresIn));

    const refreshTokenData: TRefreshToken = {
      id: crypto.randomUUID(),
      userId: token.value.userId,
      expiresAt,
    };

    const refreshTokenEntity = RefreshToken.create(refreshTokenData);

    const isSave = await this.authRepository.save(refreshTokenEntity);

    if (isSave.isErr) {
      return Result.err(isSave.error);
    }

    const accessToken = this.jwtService.generateAccessToken({
      sub: token.value.userId,
      role: user.value.role as UserRole,
    });

    const newRefreshToken = this.jwtService.generateRefreshToken({
      sub: token.value.userId,
      jti: refreshTokenEntity.id,
    });

    return Result.ok({
      accessToken,
      refreshToken: newRefreshToken,
    });
  }
}
