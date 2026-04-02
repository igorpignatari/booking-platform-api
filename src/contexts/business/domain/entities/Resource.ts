import { Result } from "@core/result/Result";
import type { TCreateResource } from "../types/TCreateResource";
import type { TPersistedResource } from "../types/TPersistedResource";

export class Resource {
  private constructor(
    readonly id: string,
    readonly businessId: string,
    readonly name: string,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(resource: TCreateResource): Result<Resource> {
    if (!resource.name && !resource.businessId) {
      return Result.err(new Error("Invalid resource"));
    }
    return Result.ok(
      new Resource(
        crypto.randomUUID(),
        resource.businessId,
        resource.name,
        true,
        new Date(),
        new Date(),
      ),
    );
  }

  static createFromPersisted(persistedResource: TPersistedResource): Resource {
    return new Resource(
      persistedResource.id,
      persistedResource.businessId,
      persistedResource.name,
      persistedResource.isActive,
      persistedResource.createdAt,
      persistedResource.updatedAt,
    );
  }
}
