import { BaseError } from "@core/errors/BaseError";
import { Result } from "../Result";

// Helper error classes for testing
class TestError extends BaseError {
  readonly _tag = "TestError";
  readonly code = "TEST_ERROR";
}

class OtherError extends BaseError {
  readonly _tag = "OtherError";
  readonly code = "OTHER_ERROR";
}

describe("Result", () => {
  // ---------- Factories ----------

  describe("ok", () => {
    it("should create a successful result with a value", () => {
      const result = Result.ok<number>(42);

      expect(result.isOk).toBe(true);
      expect(result.isErr).toBe(false);
      expect(result.value).toBe(42);
    });

    it("should create a successful result with void", () => {
      const result = Result.ok();

      expect(result.isOk).toBe(true);
      expect(result.isErr).toBe(false);
    });

    it("should create a successful result with a complex object", () => {
      const user = { id: "1", name: "John" };
      const result = Result.ok(user);

      expect(result.value).toEqual(user);
    });
  });

  describe("err", () => {
    it("should create a failed result with an error", () => {
      const error = new TestError("something went wrong");
      const result = Result.err<never, TestError>(error);

      expect(result.isOk).toBe(false);
      expect(result.isErr).toBe(true);
      expect(result.error).toBe(error);
    });

    it("should preserve the error instance and its properties", () => {
      const error = new TestError("validation failed");
      const result = Result.err<never, TestError>(error);

      expect(result.error).toBeInstanceOf(TestError);
      expect(result.error._tag).toBe("TestError");
      expect(result.error.code).toBe("TEST_ERROR");
      expect(result.error.message).toBe("validation failed");
    });
  });

  // ---------- Getters ----------

  describe("value", () => {
    it("should throw when accessing value of a failed result", () => {
      const result = Result.err<number, TestError>(new TestError("fail"));

      expect(() => result.value).toThrow("Cannot get value from a failed result");
    });
  });

  describe("error", () => {
    it("should throw when accessing error of a successful result", () => {
      const result = Result.ok<number>(42);

      expect(() => result.error).toThrow("Cannot get error from a successful result");
    });
  });

  // ---------- map ----------

  describe("map", () => {
    it("should transform the value when Ok", () => {
      const result = Result.ok<number>(2).map((n) => n * 10);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(20);
    });

    it("should propagate the error when Err", () => {
      const error = new TestError("fail");
      const result = Result.err<number, TestError>(error).map((n) => n * 10);

      expect(result.isErr).toBe(true);
      expect(result.error).toBe(error);
    });

    it("should allow chaining multiple maps", () => {
      const result = Result.ok<number>(2)
        .map((n) => n + 1)
        .map((n) => n * 2)
        .map((n) => `value: ${n}`);

      expect(result.value).toBe("value: 6");
    });

    it("should not call the mapper function when Err", () => {
      const mapper = jest.fn();
      Result.err<number, TestError>(new TestError("fail")).map(mapper);

      expect(mapper).not.toHaveBeenCalled();
    });
  });

  // ---------- mapError ----------

  describe("mapError", () => {
    it("should transform the error when Err", () => {
      const originalError = new TestError("original");
      const result = Result.err<number, TestError>(originalError).mapError(
        (e) => new OtherError(`wrapped: ${e.message}`),
      );

      expect(result.isErr).toBe(true);
      expect(result.error).toBeInstanceOf(OtherError);
      expect(result.error.message).toBe("wrapped: original");
    });

    it("should propagate the value when Ok", () => {
      const result = Result.ok<number>(42).mapError((_e) => new OtherError("should not run"));

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(42);
    });

    it("should not call the mapper function when Ok", () => {
      const mapper = jest.fn();
      Result.ok<number>(42).mapError(mapper);

      expect(mapper).not.toHaveBeenCalled();
    });
  });

  // ---------- flatMap ----------

  describe("flatMap", () => {
    it("should chain successful results", () => {
      const result = Result.ok<number>(2).flatMap((n) => Result.ok(n * 10));

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(20);
    });

    it("should propagate the initial error without calling the function", () => {
      const error = new TestError("initial fail");
      const fn = jest.fn();
      const result = Result.err<number, TestError>(error).flatMap(fn);

      expect(result.isErr).toBe(true);
      expect(result.error).toBe(error);
      expect(fn).not.toHaveBeenCalled();
    });

    it("should return the error from the chained function", () => {
      const chainedError = new TestError("chained fail");
      const result = Result.ok<number>(2).flatMap(() =>
        Result.err<number, TestError>(chainedError),
      );

      expect(result.isErr).toBe(true);
      expect(result.error).toBe(chainedError);
    });

    it("should support chaining multiple flatMaps", () => {
      const result = Result.ok<number>(1)
        .flatMap((n) => Result.ok(n + 1))
        .flatMap((n) => Result.ok(n * 2))
        .flatMap((n) => Result.ok(`value: ${n}`));

      expect(result.value).toBe("value: 4");
    });

    it("should short-circuit the chain on the first error", () => {
      const error = new TestError("fail in middle");
      const lastFn = jest.fn();

      const result = Result.ok<number>(1)
        .flatMap((n) => Result.ok(n + 1))
        .flatMap(() => Result.err<number, TestError>(error))
        .flatMap(lastFn);

      expect(result.isErr).toBe(true);
      expect(result.error).toBe(error);
      expect(lastFn).not.toHaveBeenCalled();
    });
  });

  // ---------- fold ----------

  describe("fold", () => {
    it("should call onSuccess when Ok", () => {
      const onSuccess = jest.fn((value: number) => `value: ${value}`);
      const onFailure = jest.fn();

      const result = Result.ok<number>(42).fold(onSuccess, onFailure);

      expect(onSuccess).toHaveBeenCalledWith(42);
      expect(onFailure).not.toHaveBeenCalled();
      expect(result).toBe("value: 42");
    });

    it("should call onFailure when Err", () => {
      const error = new TestError("fail");
      const onSuccess = jest.fn();
      const onFailure = jest.fn((e: TestError) => `error: ${e.message}`);

      const result = Result.err<number, TestError>(error).fold(onSuccess, onFailure);

      expect(onFailure).toHaveBeenCalledWith(error);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(result).toBe("error: fail");
    });

    it("should allow both branches to return the same type", () => {
      const okResult = Result.ok<number>(42).fold(
        (v) => v.toString(),
        () => "error",
      );
      const errResult = Result.err<number, TestError>(new TestError("x")).fold(
        (v) => v.toString(),
        () => "error",
      );

      expect(okResult).toBe("42");
      expect(errResult).toBe("error");
    });
  });

  // ---------- combine ----------

  describe("combine", () => {
    it("should return Ok with all values when all results are Ok", () => {
      const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
      const combined = Result.combine(results);

      expect(combined.isOk).toBe(true);
      expect(combined.value).toEqual([1, 2, 3]);
    });

    it("should return Err with all errors when all results are Err", () => {
      const error1 = new TestError("error 1");
      const error2 = new TestError("error 2");
      const results = [
        Result.err<number, TestError>(error1),
        Result.err<number, TestError>(error2),
      ];
      const combined = Result.combine(results);

      expect(combined.isErr).toBe(true);
      expect(combined.error).toEqual([error1, error2]);
    });

    it("should return Err with only the errors when results are mixed", () => {
      const error1 = new TestError("error 1");
      const error2 = new TestError("error 2");
      const results = [
        Result.ok(1),
        Result.err<number, TestError>(error1),
        Result.ok(2),
        Result.err<number, TestError>(error2),
      ];
      const combined = Result.combine(results);

      expect(combined.isErr).toBe(true);
      expect(combined.error).toEqual([error1, error2]);
    });

    it("should return Ok with an empty array when given an empty array", () => {
      const combined = Result.combine<number, TestError>([]);

      expect(combined.isOk).toBe(true);
      expect(combined.value).toEqual([]);
    });

    it("should preserve the order of values in successful case", () => {
      const results = [Result.ok("a"), Result.ok("b"), Result.ok("c")];
      const combined = Result.combine(results);

      expect(combined.value).toEqual(["a", "b", "c"]);
    });
  });

  // ---------- getOrElse ----------

  describe("getOrElse", () => {
    it("should return the value when Ok", () => {
      const result = Result.ok<number>(42);

      expect(result.getOrElse(0)).toBe(42);
    });

    it("should return the fallback when Err", () => {
      const result = Result.err<number, TestError>(new TestError("fail"));

      expect(result.getOrElse(0)).toBe(0);
    });
  });

  // ---------- getOrThrow ----------

  describe("getOrThrow", () => {
    it("should return the value when Ok", () => {
      const result = Result.ok<number>(42);

      expect(result.getOrThrow()).toBe(42);
    });

    it("should throw the error when Err", () => {
      const error = new TestError("fail");
      const result = Result.err<number, TestError>(error);

      expect(() => result.getOrThrow()).toThrow(error);
    });
  });

  // ---------- Integration scenarios ----------

  describe("integration scenarios", () => {
    it("should support a full fp-style pipeline", () => {
      const parseNumber = (s: string): Result<number, TestError> => {
        const n = Number(s);
        return Number.isNaN(n) ? Result.err(new TestError(`"${s}" is not a number`)) : Result.ok(n);
      };

      const result = parseNumber("10")
        .map((n) => n * 2)
        .flatMap((n) =>
          n > 100 ? Result.err<number, TestError>(new TestError("too big")) : Result.ok(n),
        )
        .fold(
          (v) => `success: ${v}`,
          (e) => `failure: ${e.message}`,
        );

      expect(result).toBe("success: 20");
    });

    it("should short-circuit on the first failure in a pipeline", () => {
      const parseNumber = (s: string): Result<number, TestError> => {
        const n = Number(s);
        return Number.isNaN(n) ? Result.err(new TestError(`"${s}" is not a number`)) : Result.ok(n);
      };

      const neverCalled = jest.fn();

      const result = parseNumber("abc")
        .map(neverCalled)
        .flatMap(neverCalled)
        .fold(
          (v) => `success: ${v}`,
          (e) => `failure: ${e.message}`,
        );

      expect(result).toBe('failure: "abc" is not a number');
      expect(neverCalled).not.toHaveBeenCalled();
    });
  });
});
