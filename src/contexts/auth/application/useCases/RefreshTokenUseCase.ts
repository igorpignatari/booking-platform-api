import type { JWTServices } from "@contexts/auth/domain/contracts/JWTServices";
import { RefreshToken } from "@contexts/auth/domain/entities/RefreshToken";
import { AuthErrors } from "@contexts/auth/domain/errors/AuthErrors";
import type { TRefreshToken } from "@contexts/auth/domain/types/TRefreshToken";
import { Result } from "@core/result/Result";
import { env } from "@shared/env/env";
import type { AuthResponse } from "../DTOs/AuthResponseDTO";
import type { RefreshTokenRequest } from "../DTOs/RefreshTokenDTO";
import type { IRefreshToken } from "../ports/input/IRefreshToken";
import type { AuthRepository } from "../ports/output/AuthRepository";

export class RefreshTokenUseCase implements IRefreshToken {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JWTServices,
  ) {}

  async execute({ refreshToken }: RefreshTokenRequest): Promise<Result<AuthResponse>> {
    const isValidToken = await this.authRepository.findByRefreshToken(refreshToken);

    if (isValidToken.isErr) {
      return Result.err(isValidToken.error);
    }
    if (isValidToken.value === null) {
      return Result.err(AuthErrors.USER_UNAUTHORIZED_ERROR.create("Token is invalid"));
    }
    if (isValidToken.value.isExpired()) {
      return Result.err(AuthErrors.USER_UNAUTHORIZED_ERROR.create("Token is expired"));
    }

    const isDelete = await this.authRepository.delete(refreshToken);
    if (isDelete.isErr) {
      return Result.err(isDelete.error);
    }
    const refreshTokenData: TRefreshToken = {
      userId: isValidToken.value.userId,
      token: this.jwtService.generateRefreshToken({
        id: isValidToken.value.userId,
      }),
      expiresInDays: Number(env.jwtRefreshExpiresIn.split("")[0]),
    };

    const newRefreshToken = RefreshToken.create(refreshTokenData);

    const isSave = await this.authRepository.save(newRefreshToken);
    if (isSave.isErr) {
      return Result.err(isSave.error);
    }

    const accessToken = this.jwtService.generateAccessToken({
      id: isValidToken.value.userId,
    });
    return Result.ok({ accessToken, refreshToken: newRefreshToken.token });
  }
}
