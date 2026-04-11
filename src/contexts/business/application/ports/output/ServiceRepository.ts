import type { Resource } from "@contexts/business/domain/entities/Resource";
import type { Service } from "@contexts/business/domain/entities/Service";
import type { Result } from "@core/result/Result";

export interface ServiceRepository {
  save(data: Service): Promise<Result<void>>;
  findResourceById(id: string): Promise<Result<Resource | null>>;
}
