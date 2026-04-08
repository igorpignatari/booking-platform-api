import { Resource } from "@contexts/business/domain/entities/Resource";
import { Result } from "@core/result/Result";
import type { CreateResourceRequest } from "../../DTOs/CreateResourceDTO";
import type { ICreateResource } from "../../ports/input/ICreateResource";
import type { ResourceRepository } from "../../ports/output/ResourceRepository";

export class CreateResourceUseCase implements ICreateResource {
  constructor(private readonly resourceRepository: ResourceRepository) {}
  async execute(request: CreateResourceRequest): Promise<Result<Resource>> {
    const resource = Resource.create(request);
    if (resource.isErr) {
      return Result.err(Promise.resolve(resource.error));
    }

    const isSaved = await this.resourceRepository.save(resource.value);
    if (isSaved.isErr) {
      return Result.err(Promise.resolve(isSaved.error));
    }

    return Result.ok(resource.value);
  }
}
