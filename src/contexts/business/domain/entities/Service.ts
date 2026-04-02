import { Result } from "@core/result/Result";
import type { TCreateService } from "../types/TCreateService";
import type { TPersistedService } from "../types/TPersistedService";

export class Service {
  private constructor(
    readonly id: string,
    readonly resourceId: string,
    readonly name: string,
    readonly duration: number,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(service: TCreateService): Result<Service> {
    if (!service.name && !service.resourceId && !service.duration) {
      return Result.err(new Error("Invalid service"));
    }
    return Result.ok(
      new Service(
        crypto.randomUUID(),
        service.resourceId,
        service.name,
        service.duration,
        true,
        new Date(),
        new Date(),
      ),
    );
  }

  static createFromPersisted(persistedService: TPersistedService): Service {
    return new Service(
      persistedService.id,
      persistedService.resourceId,
      persistedService.name,
      persistedService.duration,
      persistedService.isActive,
      persistedService.createdAt,
      persistedService.updatedAt,
    );
  }
}
