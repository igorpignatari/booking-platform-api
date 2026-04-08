import type { Resource } from "@contexts/business/domain/entities/Resource";
import type { Result } from "@core/result/Result";
import type { CreateResourceRequest } from "../../DTOs/CreateResourceDTO";

export interface ICreateResource {
  execute(request: CreateResourceRequest): Promise<Result<Resource>>;
}
