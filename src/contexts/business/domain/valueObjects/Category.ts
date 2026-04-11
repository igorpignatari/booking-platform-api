import { ValueObject } from "@core/bases/ValueObject";
import { Result } from "@core/result/Result";
import { BusinessErrors } from "../errors/BusinessErrors";

export const BusinessCategories = {
  RESTAURANT: "restaurant",
  CAFE: "cafe",
  BAR: "bar",
  DENTIST: "dentist",
  BARBER: "barber",
  DOCTOR: "doctor",
  OTHER: "other",
} as const;

export type Categories = (typeof BusinessCategories)[keyof typeof BusinessCategories];

const validCategories = new Set(Object.values(BusinessCategories));

export class Category extends ValueObject<Categories> {
  private constructor(value: Categories) {
    super(value);
  }

  static create(value: string): Result<Category> {
    if (!Category.isValid(value)) {
      return Result.err(BusinessErrors.CATEGORY_INVALID.create(`Invalid category: ${value}`));
    }

    return Result.ok(new Category(value as Categories));
  }

  static createFromKey(key: string): Result<Category> {
    if (!(key in BusinessCategories)) {
      return Result.err(BusinessErrors.CATEGORY_INVALID.create(`Invalid category: ${key}`));
    }

    const value = BusinessCategories[key as keyof typeof BusinessCategories];
    return Result.ok(new Category(value));
  }

  static createFromString(value: string): Category {
    return new Category(value as Categories);
  }

  private static isValid(value: string): value is Categories {
    return validCategories.has(value as Categories);
  }
}
