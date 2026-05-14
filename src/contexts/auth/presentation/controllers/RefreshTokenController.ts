import type { IRefreshToken } from "@contexts/auth/application/ports/input/IRefreshToken";
import { AuthErrors } from "@contexts/auth/domain/errors/AuthErrors";
import { env } from "@shared/env/env";
import { BaseController } from "@shared/presentation/http/BaseController";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { HttpResponse } from "@shared/presentation/http/HttpResponse";
import { parseDuration } from "@shared/utils/parseDuration";

export class RefreshTokenController extends BaseController {
  constructor(private readonly refreshTokenUseCase: IRefreshToken) {
    super();
  }
  protected override async execute(httpRequest: HttpRequest): Promise<HttpResponse> {
    httpRequest.logger.info("RefreshTokenController");
    const token = httpRequest.cookies?.refreshToken;

    if (!token) {
      return this.fail(AuthErrors.USER_UNAUTHORIZED_ERROR.create("Refresh token not found"));
    }

    const result = await this.refreshTokenUseCase.execute({ refreshToken: token });

    return result.fold(
      (data) =>
        this.okWithCookie(data.accessToken, {
          name: "refreshToken",
          value: data.refreshToken,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: parseDuration(env.jwtRefreshExpiresIn),
        }),
      (error) => {
        httpRequest.logger.warn("Business error", {
          error: error,
        });
        return this.fail(error);
      },
    );
  }
}
