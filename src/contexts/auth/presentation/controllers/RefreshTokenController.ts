import type { RefreshTokenRequest } from "@contexts/auth/application/DTOs/RefreshTokenDTO";
import type { IRefreshToken } from "@contexts/auth/application/ports/input/IRefreshToken";
import { BaseController } from "@shared/presentation/http/BaseController";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { HttpResponse } from "@shared/presentation/http/HttpResponse";

export class RefreshTokenController extends BaseController {
  constructor(private readonly refreshTokenUseCase: IRefreshToken) {
    super();
  }
  protected override async execute(
    httpRequest: HttpRequest<RefreshTokenRequest>,
  ): Promise<HttpResponse> {
    httpRequest.logger.info("RefreshTokenController");
    const result = await this.refreshTokenUseCase.execute(httpRequest.body);

    return result.fold(
      (data) =>
        this.okWithCookie(data.accessToken, {
          name: "refreshToken",
          value: data.refreshToken,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
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
