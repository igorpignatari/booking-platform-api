import { Result } from "@core/result/Result";
import { Email } from "@core/valueObjects/Email";
import type { TCreateBusiness } from "../types/TCreateBusiness";
import type { TPersistedBusiness } from "../types/TPersistedBusiness";
import { Address } from "../valueObjects/Address";
import { Category } from "../valueObjects/Category";

export class Business {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly name: string,
    readonly phone: string,
    readonly timezone: string,
    readonly address: Address,
    readonly category: Category,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly email?: Email,
    readonly taxId?: string,
  ) {}

  static create(rawBusiness: TCreateBusiness): Result<Business> {
    const category = Category.create(rawBusiness.category);
    const address = Address.create(rawBusiness.address);
    const email = rawBusiness.email ? Email.create(rawBusiness.email) : undefined;

    const toValidate = [category, address, ...(email ? [email] : [])];
    return Result.combine(toValidate).map(
      () =>
        new Business(
          crypto.randomUUID(),
          rawBusiness.userId,
          rawBusiness.name,
          rawBusiness.phone,
          rawBusiness.timezone,
          address.value,
          category.value,
          true,
          new Date(),
          new Date(),
          email?.value,
          rawBusiness.taxId,
        ),
    );
  }

  static createFromPersisted(persistedBusiness: TPersistedBusiness): Business {
    return new Business(
      persistedBusiness.id,
      persistedBusiness.userId,
      persistedBusiness.name,
      persistedBusiness.phone,
      persistedBusiness.timezone,
      Address.createFromString(persistedBusiness.address),
      Category.createFromString(persistedBusiness.category),
      persistedBusiness.isActive,
      persistedBusiness.createdAt,
      persistedBusiness.updatedAt,
      persistedBusiness.email ? Email.createFromString(persistedBusiness.email) : undefined,
      persistedBusiness.taxId,
    );
  }
}
