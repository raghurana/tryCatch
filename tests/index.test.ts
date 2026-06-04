import { tryCatch } from "../src";
describe("tryCatch tests", () => {
  describe("successful executions", () => {
    test("should return result on resolved promise", async () => {
      const result = await tryCatch(async () => "resolved value");

      expect(result).toEqual({ result: "resolved value" });
      expect(result).not.toHaveProperty("error");
    });

    test("should return result for non-promise value", async () => {
      const result = await tryCatch(() => 42);

      expect(result).toEqual({ result: 42 });
      expect(result).not.toHaveProperty("error");
    });

    test.each([
      ["undefined", undefined],
      ["null", null],
      ["false", false],
      ["zero", 0],
      ["empty string", ""],
    ])("should return %s as a successful result", async (_label, value) => {
      const result = await tryCatch(() => value);

      expect(result).toEqual({ result: value });
      expect(result).not.toHaveProperty("error");
    });

    test("should preserve object result references", async () => {
      const value = { id: "rule-1", enabled: true };

      const result = await tryCatch(() => value);

      expect(result).toEqual({ result: value });
      expect(result.result).toBe(value);
    });

    test("should return Error objects as successful results when they are returned", async () => {
      const value = new Error("returned error");

      const result = await tryCatch(() => value);

      expect(result).toEqual({ result: value });
      expect(result.result).toBe(value);
      expect(result).not.toHaveProperty("error");
    });

    test("should wait for async work before returning the result", async () => {
      const calls: string[] = [];

      const result = await tryCatch(async () => {
        calls.push("started");
        await Promise.resolve();
        calls.push("finished");
        return calls.length;
      });

      expect(result).toEqual({ result: 2 });
      expect(calls).toEqual(["started", "finished"]);
    });

    test("should call the input function exactly once", async () => {
      const input = jest.fn(() => "value");

      const result = await tryCatch(input);

      expect(result).toEqual({ result: "value" });
      expect(input).toHaveBeenCalledTimes(1);
    });
  });

  describe("failed executions", () => {
    test("should return error on rejected promise", async () => {
      const expectedError = new Error("rejected promise");

      const result = await tryCatch(() => Promise.reject(expectedError));

      expect(result).toEqual({ error: expectedError });
      expect(result.error).toBe(expectedError);
      expect(result).not.toHaveProperty("result");
    });

    test("should handle thrown error inside async function", async () => {
      const expectedError = new TypeError("async failure");

      const result = await tryCatch(async () => {
        throw expectedError;
      });

      expect(result).toEqual({ error: expectedError });
      expect(result.error).toBe(expectedError);
      expect(result).not.toHaveProperty("result");
    });

    test("should handle thrown error inside sync function", async () => {
      const expectedError = new RangeError("sync failure");

      const result = await tryCatch(() => {
        throw expectedError;
      });

      expect(result).toEqual({ error: expectedError });
      expect(result.error).toBe(expectedError);
      expect(result).not.toHaveProperty("result");
    });

    test("should preserve custom Error subclasses", async () => {
      const expectedError = new CustomError("custom failure");

      const result = await tryCatch(() => {
        throw expectedError;
      });

      expect(result).toEqual({ error: expectedError });
      expect(result.error).toBeInstanceOf(CustomError);
      expect(result.error).toBe(expectedError);
    });

    test("should convert thrown string into Error instance", async () => {
      const result = await tryCatch(() => {
        throw "string error";
      });

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("string error");
      expect(result).not.toHaveProperty("result");
    });

    test("should convert rejected string into Error instance", async () => {
      const result = await tryCatch(() => Promise.reject("rejected string"));

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe("rejected string");
      expect(result).not.toHaveProperty("result");
    });

    test.each([
      ["number", 500],
      ["boolean", false],
      ["object", { code: "E_RULE" }],
      ["null", null],
      ["undefined", undefined],
    ])("should preserve non-string thrown %s values", async (_label, thrownValue) => {
      const result = await tryCatch(() => {
        throw thrownValue;
      });

      expect(result).toEqual({ error: thrownValue });
      expect(result.error).toBe(thrownValue);
      expect(result).not.toHaveProperty("result");
    });

    test("should not call the input function more than once when it throws", async () => {
      const expectedError = new Error("one call");
      const input = jest.fn(() => {
        throw expectedError;
      });

      const result = await tryCatch(input);

      expect(result).toEqual({ error: expectedError });
      expect(input).toHaveBeenCalledTimes(1);
    });
  });
});

class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomError";
  }
}
