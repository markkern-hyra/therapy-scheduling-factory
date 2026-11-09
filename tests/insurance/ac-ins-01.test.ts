// AC-INS-01 (зріз 3): рядок картки для статусу, який ще ніхто не позначав. Те саме з бази — tests/db/ac-ins-01.test.ts.
import { describe, expect, it } from "vitest";
import { insuranceLine } from "./support";

describe("рядок статусу страхування в картці", () => {
  it("AC-INS-01: статус ще не позначено — у картці «Insurance: Not set»", async () => {
    expect(await insuranceLine(null)).toBe("Insurance: Not set");
  });
});
