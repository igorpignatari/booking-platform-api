import type { LoginRequest } from "@contexts/auth/application/DTOs/LoginDTO";
import type { ILogin } from "@contexts/auth/application/ports/input/ILogin";
import { env } from "@shared/env/env";
import { BaseController } from "@shared/presentation/http/BaseController";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { HttpResponse } from "@shared/presentation/http/HttpResponse";
import { parseDuration } from "@shared/utils/parseDuration";

export class LoginController extends BaseController {
  constructor(private readonly loginUseCase: ILogin) {
    super();
  }

  protected override async execute(httpRequest: HttpRequest<LoginRequest>): Promise<HttpResponse> {
    httpRequest.logger.info("LoginController");

    const result = await this.loginUseCase.execute(httpRequest.body);

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
