import type { BusinessRepository } from "@contexts/business/application/ports/output/BusinessRepository";
import type { Business } from "@contexts/business/domain/entities/Business";
import { Result } from "@core/result/Result";

export class BusinessRepositoryInMemory implements BusinessRepository {
  businesses: Business[] = [];
  save(business: Business): Promise<Result<void>> {
    this.businesses.push(business);
    return Promise.resolve(Result.ok(undefined));
  }
}
