import { makeBusiness } from "@contexts/business/__tests__/factories/entities/makeBusiness";
import { makeRegisterBusinessUseCase } from "@contexts/business/__tests__/factories/useCase/business/makeRegisterBusinessUseCase";
import { makeMockBusinessRepository } from "@contexts/business/__tests__/mocks/makeMockBusinessRepository";
import { Result } from "@core/result/Result";

describe("Register business use case mock", () => {
  describe("success", () => {
    it("it should Register a business", async () => {
      const mockBusinessRepository = makeMockBusinessRepository();

      mockBusinessRepository.save.mockResolvedValue(Result.ok());
      mockBusinessRepository.findById.mockResolvedValue(Result.ok(null));

      const { useCase } = makeRegisterBusinessUseCase({
        businessRepository: mockBusinessRepository,
      });
      const input = makeBusiness();

      const result = await useCase.execute(input);

      expect(result.isOk).toBe(true);
      expect(result.value).toBeDefined();

      expect(mockBusinessRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("failure", () => {
    it("it should return error when save fails", async () => {
      const mockBusinessRepository = makeMockBusinessRepository();

      mockBusinessRepository.save.mockResolvedValue(Result.err(new Error("DB error")));

      const { useCase } = makeRegisterBusinessUseCase({
        businessRepository: mockBusinessRepository,
      });
      const input = makeBusiness();

      const result = await useCase.execute(input);

      expect(result.isErr).toBe(true);
      expect(result.error).toBeInstanceOf(Error);

      expect(mockBusinessRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
