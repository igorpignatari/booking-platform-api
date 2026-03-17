import { Result } from "@core/result/Result";

describe("Result", () => {
  describe("ok", () => {
    it("should create a successful result", () => {
      const result = Result.ok(42);
      expect(result.isOk).toBe(true);
      expect(result.isErr).toBe(false);
      expect(result.value).toBe(42);
    });
  });

  describe("err", () => {
    it("should create a failed result", () => {
      const error = new Error("oops");
      const result = Result.err(error);
      expect(result.isErr).toBe(true);
      expect(result.isOk).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe("map", () => {
    it("should transform value on success", () => {
      const result = Result.ok(2).map((x) => x * 3);
      expect(result.value).toBe(6);
    });

    it("should propagate error on failure", () => {
      const result = Result.err<number>("err").map((x) => x * 3);
      expect(result.isErr).toBe(true);
    });
  });

  describe("flatMap", () => {
    it("should chain results", () => {
      const result = Result.ok(2).flatMap((x) => Result.ok(x + 1));
      expect(result.value).toBe(3);
    });
  });

  describe("pipe", () => {
    it("should pipe multiple transformations", () => {
      const result = Result.ok(1).pipe(
        (r) => r.map((x) => x + 1),
        (r) => r.map((x) => x * 2),
      );
      expect(result.value).toBe(4);
    });

    it("should short-circuit on error", () => {
      const result = Result.err<number>("fail").pipe(
        (r) => r.map((x) => x + 1),
        (r) => r.map((x) => x * 2),
      );
      expect(result.isErr).toBe(true);
    });
  });

  describe("combine", () => {
    it("should return ok when all succeed", () => {
      const result = Result.combine([Result.ok(1), Result.ok(2)]);
      expect(result.isOk).toBe(true);
    });

    it("should collect all errors", () => {
      const result = Result.combine([Result.ok(1), Result.err("e1"), Result.err("e2")]);
      expect(result.isErr).toBe(true);
      expect(result.error).toEqual(["e1", "e2"]);
    });
  });
});
