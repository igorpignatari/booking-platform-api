import type { RegisterBusinessRequest } from "@contexts/business/application/DTOs/RegisterBusinessDTO";
import type { IRegisterBusiness } from "@contexts/business/application/ports/input/IRegisterBusiness";
import { BaseController } from "@shared/presentation/http/BaseController";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { HttpResponse } from "@shared/presentation/http/HttpResponse";
import type { RegisterBusinessViewModel } from "../presenters/RegisterBusinessViewModel";
import { registerBusinessToHttp } from "../presenters/registerBusinessToHttp";

export class RegisterBusinessController extends BaseController {
  constructor(private readonly registerBusinessUseCase: IRegisterBusiness) {
    super();
  }
  protected override async execute(
    httpRequest: HttpRequest<RegisterBusinessRequest>,
  ): Promise<HttpResponse<RegisterBusinessViewModel>> {
    httpRequest.logger.info("RegisterBusinessController");
    const result = await this.registerBusinessUseCase.execute(httpRequest.body);

    return result.fold(
      (data) => this.created(registerBusinessToHttp(data)),
      (error) => {
        httpRequest.logger.warn("Business error", {
          error: error,
        });
        return this.fail(error);
      },
    );
  }
}
