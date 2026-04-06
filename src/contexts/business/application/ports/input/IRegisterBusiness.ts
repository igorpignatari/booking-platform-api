import type { Business } from "@contexts/business/domain/entities/Business";
import type { Result } from "@core/result/Result";
import type { RegisterBusinessRequest } from "../../DTOs/RegisterBusinessDTO";

export interface IRegisterBusiness {
  execute(request: RegisterBusinessRequest): Promise<Result<Business>>;
}
