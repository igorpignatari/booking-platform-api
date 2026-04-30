import { BaseError } from "@core/errors/BaseError";
import { Result } from "@core/result/Result";
import { tryCatch, tryCatchAsync } from "../tryCatch";

// ---------- Test fixtures ----------

class TestError extends BaseError {
  readonly _tag = "TestError" as const;

  static create(message: string): TestError {
    return new TestError(message);
  }
}

class WrappedError extends BaseError {
  readonly _tag = "WrappedError" as const;

  constructor(
    message: string,
    public readonly cause: unknown,
  ) {
    super(message);
  }

  static fromUnknown(err: unknown): WrappedError {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new WrappedError(message, err);
  }
}

// ---------- tryCatch (sync) ----------

describe("tryCatch (sync)", () => {
  describe("when fn returns successfully", () => {
    it("returns Ok with the produced value", () => {
      const result = tryCatch(
        () => 42,
        (err) => TestError.create(String(err)),
      );

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(42);
    });

    it("preserves the inferred value type", () => {
      const result = tryCatch(
        () => ({ id: "abc", count: 1 }),
        (err) => TestError.create(String(err)),
      );

      // Compile-time + runtime check
      expect(result.value.id).toBe("abc");
      expect(result.value.count).toBe(1);
    });

    it("does not call onError when fn succeeds", () => {
      const onError = jest.fn((err: unknown) => TestError.create(String(err)));

      tryCatch(() => "ok", onError);

      expect(onError).not.toHaveBeenCalled();
    });

    it("supports functions that return undefined", () => {
      const result = tryCatch<void, TestError>(
        () => undefined,
        (err) => TestError.create(String(err)),
      );

      expect(result.isOk).toBe(true);
      expect(result.value).toBeUndefined();
    });
  });

  describe("when fn throws", () => {
    it("returns Err with the mapped error", () => {
      const result = tryCatch(
        () => {
          throw new Error("boom");
        },
        (err) => TestError.create(err instanceof Error ? err.message : "fallback"),
      );

      expect(result.isErr).toBe(true);
      expect(result.error).toBeInstanceOf(TestError);
      expect(result.error.message).toBe("boom");
    });

    it("calls onError exactly once with the thrown value", () => {
      const thrown = new Error("specific failure");
      const onError = jest.fn((err: unknown) => WrappedError.fromUnknown(err));

      tryCatch(() => {
        throw thrown;
      }, onError);

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(thrown);
    });

    it("captures non-Error throws (string, number, object)", () => {
      const stringResult = tryCatch(
        () => {
          throw "string error";
        },
        (err) => WrappedError.fromUnknown(err),
      );
      expect(stringResult.isErr).toBe(true);
      expect((stringResult.error as WrappedError).cause).toBe("string error");

      const numberResult = tryCatch(
        () => {
          throw 42;
        },
        (err) => WrappedError.fromUnknown(err),
      );
      expect(numberResult.isErr).toBe(true);
      expect((numberResult.error as WrappedError).cause).toBe(42);

      const objectResult = tryCatch(
        () => {
          throw { code: "X" };
        },
        (err) => WrappedError.fromUnknown(err),
      );
      expect(objectResult.isErr).toBe(true);
      expect((objectResult.error as WrappedError).cause).toEqual({ code: "X" });
    });

    it("does not let exceptions escape the helper", () => {
      expect(() =>
        tryCatch(
          () => {
            throw new Error("must be caught");
          },
          (err) => WrappedError.fromUnknown(err),
        ),
      ).not.toThrow();
    });
  });

  describe("integration with Result combinators", () => {
    it("composes with map when Ok", () => {
      const result = tryCatch(
        () => "10",
        (err) => TestError.create(String(err)),
      ).map((v) => Number.parseInt(v, 10) * 2);

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(20);
    });

    it("short-circuits map when Err", () => {
      const mapper = jest.fn((v: number) => v * 2);

      const result = tryCatch(
        (): number => {
          throw new Error("nope");
        },
        (err) => TestError.create((err as Error).message),
      ).map(mapper);

      expect(result.isErr).toBe(true);
      expect(mapper).not.toHaveBeenCalled();
    });
  });
});

// ---------- tryCatchAsync ----------

describe("tryCatchAsync", () => {
  describe("when fn resolves successfully", () => {
    it("returns Ok with the resolved value", async () => {
      const result = await tryCatchAsync(
        async () => 42,
        (err) => TestError.create(String(err)),
      );

      expect(result.isOk).toBe(true);
      expect(result.value).toBe(42);
    });

    it("supports functions that resolve to undefined (void operations)", async () => {
      const result = await tryCatchAsync<void, TestError>(
        async () => {
          // simulate a write-only side effect (e.g. INSERT)
        },
        (err) => TestError.create(String(err)),
      );

      expect(result.isOk).toBe(true);
      expect(result.value).toBeUndefined();
    });

    it("does not call onError when promise resolves", async () => {
      const onError = jest.fn((err: unknown) => TestError.create(String(err)));

      await tryCatchAsync(async () => "ok", onError);

      expect(onError).not.toHaveBeenCalled();
    });

    it("awaits the promise before wrapping in Ok", async () => {
      const result = await tryCatchAsync(
        () => new Promise<string>((resolve) => setTimeout(() => resolve("delayed"), 10)),
        (err) => TestError.create(String(err)),
      );

      expect(result.isOk).toBe(true);
      expect(result.value).toBe("delayed");
    });
  });

  describe("when fn rejects", () => {
    it("returns Err with the mapped error", async () => {
      const result = await tryCatchAsync(
        async () => {
          throw new Error("db connection lost");
        },
        (err) => WrappedError.fromUnknown(err),
      );

      expect(result.isErr).toBe(true);
      expect(result.error).toBeInstanceOf(WrappedError);
      expect(result.error.message).toBe("db connection lost");
    });

    it("captures rejections from Promise.reject (not just thrown errors)", async () => {
      const result = await tryCatchAsync(
        () => Promise.reject(new Error("rejected")),
        (err) => WrappedError.fromUnknown(err),
      );

      expect(result.isErr).toBe(true);
      expect(result.error.message).toBe("rejected");
    });

    it("calls onError exactly once with the rejection reason", async () => {
      const reason = new Error("specific failure");
      const onError = jest.fn((err: unknown) => WrappedError.fromUnknown(err));

      await tryCatchAsync(() => Promise.reject(reason), onError);

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(reason);
    });

    it("captures synchronous throws inside async function", async () => {
      const result = await tryCatchAsync(
        async () => {
          // throws synchronously before any await
          throw new Error("sync throw in async fn");
        },
        (err) => WrappedError.fromUnknown(err),
      );

      expect(result.isErr).toBe(true);
      expect(result.error.message).toBe("sync throw in async fn");
    });

    it("captures non-Error rejections", async () => {
      const result = await tryCatchAsync(
        () => Promise.reject("string rejection"),
        (err) => WrappedError.fromUnknown(err),
      );

      expect(result.isErr).toBe(true);
      expect((result.error as WrappedError).cause).toBe("string rejection");
    });

    it("does not let rejections escape the helper", async () => {
      await expect(
        tryCatchAsync(
          () => Promise.reject(new Error("must be caught")),
          (err) => WrappedError.fromUnknown(err),
        ),
      ).resolves.toBeDefined();
    });
  });

  describe("integration with Result combinators", () => {
    it("composes with flatMap when Ok", async () => {
      const result = (
        await tryCatchAsync(
          async () => "user-123",
          (err) => TestError.create(String(err)),
        )
      ).flatMap((id) => Result.ok(id.toUpperCase()));

      expect(result.isOk).toBe(true);
      expect(result.value).toBe("USER-123");
    });

    it("short-circuits flatMap when Err", async () => {
      const next = jest.fn(() => Result.ok("never reached"));

      const result = (
        await tryCatchAsync(
          async (): Promise<string> => {
            throw new Error("upstream failure");
          },
          (err) => TestError.create((err as Error).message),
        )
      ).flatMap(next);

      expect(result.isErr).toBe(true);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("realistic scenarios", () => {
    it("simulates a successful repository insert", async () => {
      const fakeDAO = {
        insert: jest.fn().mockResolvedValue(undefined),
      };

      const result = await tryCatchAsync(
        async () => {
          await fakeDAO.insert({ id: "1", name: "Filhotera" });
        },
        (err) => WrappedError.fromUnknown(err),
      );

      expect(result.isOk).toBe(true);
      expect(fakeDAO.insert).toHaveBeenCalledTimes(1);
    });

    it("simulates a failing repository insert (DB unavailable)", async () => {
      const fakeDAO = {
        insert: jest.fn().mockRejectedValue(new Error("ECONNREFUSED")),
      };

      const result = await tryCatchAsync(
        async () => {
          await fakeDAO.insert({ id: "1" });
        },
        (err) => WrappedError.fromUnknown(err),
      );

      expect(result.isErr).toBe(true);
      expect(result.error.message).toBe("ECONNREFUSED");
    });
  });
});
