import type { LoginRequest } from "@contexts/auth/application/DTOs/LoginDTO";
import type { ILogin } from "@contexts/auth/application/ports/input/ILogin";
import { BaseController } from "@shared/presentation/http/BaseController";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { HttpResponse } from "@shared/presentation/http/HttpResponse";

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
