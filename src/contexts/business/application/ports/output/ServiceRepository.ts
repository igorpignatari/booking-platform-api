import type { Service } from "@contexts/business/domain/entities/Service";
import type { Result } from "@core/result/Result";

export interface ServiceRepository {
  save(data: Service): Promise<Result<void>>;
}
