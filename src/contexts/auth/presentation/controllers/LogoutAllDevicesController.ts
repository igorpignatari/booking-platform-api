import type { LogoutRequest } from "@contexts/auth/application/DTOs/LogoutDTO";
import type { ILogoutAllDevices } from "@contexts/auth/application/ports/input/ILogoutAllDevices";
import { BaseController } from "@shared/presentation/http/BaseController";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { HttpResponse } from "@shared/presentation/http/HttpResponse";

export class LogoutAllDevicesController extends BaseController {
  constructor(private readonly logoutAllDevicesUseCase: ILogoutAllDevices) {
    super();
  }

  protected override async execute(httpRequest: HttpRequest<LogoutRequest>): Promise<HttpResponse> {
    httpRequest.logger.info("LogoutAllDevicesController");
    const result = await this.logoutAllDevicesUseCase.execute(httpRequest.body);

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
