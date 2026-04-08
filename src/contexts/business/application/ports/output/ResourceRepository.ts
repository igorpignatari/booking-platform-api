import type { Resource } from "@contexts/business/domain/entities/Resource";
import type { Result } from "@core/result/Result";

export interface ResourceRepository {
  save(resource: Resource): Promise<Result<void>>;
}
