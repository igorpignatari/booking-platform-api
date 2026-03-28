import type { RefreshTokenRequest } from "@contexts/auth/application/DTOs/RefreshTokenDTO";
import type { ILogout } from "@contexts/auth/application/ports/input/ILogout";
import { BaseController } from "@shared/presentation/http/BaseController";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { HttpResponse } from "@shared/presentation/http/HttpResponse";

export class LogoutController extends BaseController {
  constructor(private readonly logoutUseCase: ILogout) {
    super();
  }
  protected override async execute(
    httpRequest: HttpRequest<RefreshTokenRequest>,
  ): Promise<HttpResponse> {
    httpRequest.logger.info("LogoutController");
    const result = await this.logoutUseCase.execute(httpRequest.body);

    return result.fold(
      () =>
        this.okWithCookie(null, {
          name: "refreshToken",
          value: "",
          maxAge: 0,
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
