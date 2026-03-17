export abstract class ValueObject<T> {
  constructor(private readonly _value: T) {
    Object.freeze(this);
  }

  getValue(): T {
    return this._value;
  }

  equals(value: ValueObject<T>): boolean {
    return this._value === value._value;
  }

  toString(): string {
    return String(this._value);
  }

  abstract validate(value: T): boolean;
}
