import { ValueObject } from "@core/bases/ValueObject";
import { Result } from "@core/result/Result";
import type { TCreateAddress } from "../types/TCreateAddress";

//TODO: Fix this class, create new vos for each field, improve validation
export class Address extends ValueObject<TCreateAddress> {
  private constructor(address: TCreateAddress) {
    super(address);
  }

  static create(address: TCreateAddress): Result<Address> {
    if (!this.validate(address)) {
      return Result.err(new Error("Invalid address"));
    }
    return Result.ok(new Address(address));
  }

  static createFromString(address: TCreateAddress): Address {
    return new Address(address);
  }

  private static validate(address: TCreateAddress): boolean {
    if (!address.street || address.street.length < 3 || address.street.length > 100) {
      console.log("invalid street");
      return false;
    }
    if (!address.number && Number(address.number) >= 1 && Number(address.number) < 100) {
      console.log(Number(address.number) >= 1);
      console.log("invalid number");
      return false;
    }
    if (
      !address.neighborhood ||
      address.neighborhood.length < 3 ||
      address.neighborhood.length > 100
    ) {
      console.log("invalid neighborhood");
      return false;
    }
    if (!address.city || address.city.length < 3 || address.city.length > 100) {
      console.log("invalid city");
      return false;
    }
    if (!address.state || address.state.length < 2 || address.state.length > 2) {
      console.log("invalid state");
      return false;
    }
    if (!address.country || address.country.length < 3 || address.country.length > 100) {
      console.log("invalid country");
      return false;
    }
    if (!address.zipCode || address.zipCode.length > 8) {
      console.log("invalid zipCode");
      return false;
    }
    if (address.complement && address.complement.length > 100) {
      console.log("invalid complement");
      return false;
    }

    return true;
  }
}
