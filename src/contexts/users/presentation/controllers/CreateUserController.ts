import type { CreateUserRequest } from "@contexts/users/application/DTOs/createUserDTO";
import type { ICreateUser } from "@contexts/users/application/ports/input/ICreateUser";
import { BaseController } from "@shared/presentation/http/BaseController";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { HttpResponse } from "@shared/presentation/http/HttpResponse";
import type { CreateUserViewModel } from "../presenters/createUser/CreateUserViewModel";
import { createUserToHttp } from "../presenters/createUser/createUserToHttp";

export class CreateUserController extends BaseController {
  constructor(private readonly createUserUseCase: ICreateUser) {
    super();
  }
  protected override async execute(
    httpRequest: HttpRequest<CreateUserRequest>,
  ): Promise<HttpResponse<CreateUserViewModel>> {
    httpRequest.logger.info("CreateUserController");

    const result = await this.createUserUseCase.execute(httpRequest.body);

    return result.fold(
      (data) => this.created(createUserToHttp(data)),
      (error) => {
        httpRequest.logger.warn("Business error", {
          error: error,
        });
        return this.fail(error);
      },
    );
  }
}
