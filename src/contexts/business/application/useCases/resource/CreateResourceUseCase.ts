import { Resource } from "@contexts/business/domain/entities/Resource";
import { BusinessErrors } from "@contexts/business/domain/errors/BusinessErrors";
import { Result } from "@core/result/Result";
import type { CreateResourceRequest } from "../../DTOs/CreateResourceDTO";
import type { ICreateResource } from "../../ports/input/ICreateResource";
import type { ResourceRepository } from "../../ports/output/ResourceRepository";

export class CreateResourceUseCase implements ICreateResource {
  constructor(private readonly resourceRepository: ResourceRepository) {}
  async execute(request: CreateResourceRequest): Promise<Result<Resource>> {
    const isBusinessExists = await this.resourceRepository.findBusinessById(request.businessId);
    if (isBusinessExists.isErr) {
      return Result.err(isBusinessExists.error);
    }
    if (isBusinessExists.value === null) {
      return Result.err(BusinessErrors.BUSINESS_NOT_FOUND.create("Business not found"));
    }

    const resource = Resource.create(request);
    if (resource.isErr) {
      return Result.err(resource.error);
    }

    const isSaved = await this.resourceRepository.save(resource.value);
    if (isSaved.isErr) {
      return Result.err(isSaved.error);
    }

    return Result.ok(resource.value);
  }
}
