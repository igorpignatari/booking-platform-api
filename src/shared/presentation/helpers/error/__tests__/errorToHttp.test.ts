import { CoreErrors } from "@core/errors/CoreErrors";
import { DBError } from "@shared/infra/errors/DBError";
import { errorMessageParser } from "../errorMessageParser";
import { errorToHttp } from "../errorToHttp";

describe("errorToHttp", () => {
  it("should return a 422 status code when ValidationError", () => {
    const invalidEmailError = CoreErrors.INVALID_EMAIL.create("Invalid email");
    const invalidPasswordError = CoreErrors.INVALID_PASSWORD.create("Invalid password");

    const error = errorToHttp(errorMessageParser([invalidEmailError, invalidPasswordError]));
    console.log(error);
    expect(error.statusCode).toBe(422);
  });

  it("should return a 404 status code when NotFoundError", () => {
    const error = errorToHttp({
      _tag: "NotFoundError",
      message: "User not found",
    });
    expect(error.statusCode).toBe(404);
  });

  it("should return a 401 status code when UnauthorizedError", () => {
    const error = errorToHttp({
      _tag: "UnauthorizedError",
      message: "User not authorized",
    });
    expect(error.statusCode).toBe(401);
  });

  it("should return a 403 status code when ForbiddenError", () => {
    const error = errorToHttp({
      _tag: "ForbiddenError",
      message: "User not authorized",
    });
    expect(error.statusCode).toBe(403);
  });

  it("should return a 500 status code when default", () => {
    const error = errorToHttp(errorMessageParser([DBError.create("Internal error")]));
    expect(error.statusCode).toBe(500);
  });
});
