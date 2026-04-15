import type { Business } from "@contexts/business/domain/entities/Business";
import type { Result } from "@core/result/Result";

export interface BusinessRepository {
  save(business: Business): Promise<Result<void>>;
  findById(id: string): Promise<Result<Business | null>>;
}
