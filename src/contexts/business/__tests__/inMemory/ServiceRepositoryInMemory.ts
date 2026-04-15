import type { ServiceRepository } from "@contexts/business/application/ports/output/ServiceRepository";
import type { Service } from "@contexts/business/domain/entities/Service";
import { Result } from "@core/result/Result";

export class ServiceRepositoryInMemory implements ServiceRepository {
  services: Service[] = [];

  async save(service: Service): Promise<Result<void>> {
    this.services.push(service);
    return Result.ok(undefined);
  }
}
