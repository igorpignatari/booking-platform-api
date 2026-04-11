import { NotFoundError, ValidationError } from "@shared/errors/httpErrors";
//TODO: fix addres error class
class BusinessNotFoundError extends NotFoundError {
  private constructor(message: string) {
    super(message, "BUSINESS_NOT_FOUND");
  }

  static create(message: string): BusinessNotFoundError {
    return new BusinessNotFoundError(message);
  }
}

class ResourceNotFoundError extends NotFoundError {
  private constructor(message: string) {
    super(message, "RESOURCE_NOT_FOUND");
  }

  static create(message: string): ResourceNotFoundError {
    return new ResourceNotFoundError(message);
  }
}

class CategoryInvalidError extends ValidationError {
  private constructor(message: string) {
    super(message, "CATEGORY_INVALID");
  }

  static create(message: string): CategoryInvalidError {
    return new CategoryInvalidError(message);
  }
}

class AddressInvalidError extends ValidationError {
  private constructor(message: string) {
    super(message, "ADDRESS_INVALID");
  }

  static create(message: string): AddressInvalidError {
    return new AddressInvalidError(message);
  }
}

export const BusinessErrors = {
  BUSINESS_NOT_FOUND: BusinessNotFoundError,
  RESOURCE_NOT_FOUND: ResourceNotFoundError,
  CATEGORY_INVALID: CategoryInvalidError,
  ADDRESS_INVALID: AddressInvalidError,
} as const;
