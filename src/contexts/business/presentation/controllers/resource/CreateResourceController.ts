import type { CreateResourceRequest } from "@contexts/business/application/DTOs/CreateResourceDTO";
import type { ICreateResource } from "@contexts/business/application/ports/input/ICreateResource";
import { BaseController } from "@shared/presentation/http/BaseController";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { HttpResponse } from "@shared/presentation/http/HttpResponse";
import type { CreateResourceViewModel } from "../../presenters/CreateResourceViewModel";
import { createResourceToHttp } from "../../presenters/createResourceToHttp";

export class CreateResourceController extends BaseController {
  constructor(private readonly createResourceUseCase: ICreateResource) {
    super();
  }
  protected override async execute(
    httpRequest: HttpRequest<CreateResourceRequest>,
  ): Promise<HttpResponse<CreateResourceViewModel>> {
    httpRequest.logger.info("Create resource controller");

    const result = await this.createResourceUseCase.execute(httpRequest.body);

    return result.fold(
      (data) => this.created(createResourceToHttp(data)),
      (error) => {
        httpRequest.logger.warn("Business error", {
          error: error,
        });
        return this.fail(error);
      },
    );
  }
}
