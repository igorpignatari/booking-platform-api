import type { CreateServiceRequest } from "@contexts/business/application/DTOs/CreateServiceDTO";
import type { ICreateService } from "@contexts/business/application/ports/input/ICreateService";
import { BaseController } from "@shared/presentation/http/BaseController";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { HttpResponse } from "@shared/presentation/http/HttpResponse";
import type { CreateServiceViewModel } from "../../presenters/CreateServiceViewModel";
import { createServiceToHttp } from "../../presenters/createServiceToHttp";

export class CreateServiceController extends BaseController {
  constructor(private readonly createServiceUseCase: ICreateService) {
    super();
  }
  protected override async execute(
    httpRequest: HttpRequest<CreateServiceRequest>,
  ): Promise<HttpResponse<CreateServiceViewModel>> {
    httpRequest.logger.info("Create service controller");

    const result = await this.createServiceUseCase.execute(httpRequest.body);

    return result.fold(
      (data) => this.created(createServiceToHttp(data)),
      (error) => {
        httpRequest.logger.warn("Business error", {
          error: error,
        });
        return this.fail(error);
      },
    );
  }
}
