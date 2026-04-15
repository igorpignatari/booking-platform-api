import type { ResourceRepository } from "@contexts/business/application/ports/output/ResourceRepository";
import type { Resource } from "@contexts/business/domain/entities/Resource";
import { Result } from "@core/result/Result";

export class ResourceRepositoryInMemory implements ResourceRepository {
  resources: Resource[] = [];

  save(resource: Resource): Promise<Result<void>> {
    this.resources.push(resource);
    return Promise.resolve(Result.ok(undefined));
  }

  findById(id: string): Promise<Result<Resource | null>> {
    const resource = this.resources.find((x) => x.id === id);
    return Promise.resolve(Result.ok(resource ? resource : null));
  }
}
