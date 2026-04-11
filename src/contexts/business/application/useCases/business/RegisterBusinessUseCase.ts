import { Business } from "@contexts/business/domain/entities/Business";
import { Result } from "@core/result/Result";
import type { RegisterBusinessRequest } from "../../DTOs/RegisterBusinessDTO";
import type { IRegisterBusiness } from "../../ports/input/IRegisterBusiness";
import type { BusinessRepository } from "../../ports/output/BusinessRepository";

export class RegisterBusinessUseCase implements IRegisterBusiness {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(request: RegisterBusinessRequest): Promise<Result<Business>> {
    const business = Business.create({
      userId: request.userId,
      name: request.name,
      phone: request.phone,
      timezone: request.timezone,
      address: request.address,
      category: request.category,
      email: request.email,
      taxId: request.taxId,
    });

    if (business.isErr) {
      return Result.err(business.error);
    }

    const isSaved = await this.businessRepository.save(business.value);
    if (isSaved.isErr) {
      return Result.err(isSaved.error);
    }
    return Result.ok(business.value);
  }
}
