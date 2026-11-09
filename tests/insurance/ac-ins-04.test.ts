// AC-INS-04 (зріз 3): рядок картки «Not accepted». Що терапевт бачить лише свого клієнта — tests/db/ac-ins-04.test.ts.
import { describe, expect, it } from "vitest";
import { insuranceLine } from "./support";

describe("рядок статусу страхування в картці", () => {
  it("AC-INS-04: статус «Not accepted» — у картці «Insurance: Not accepted»", async () => {
    expect(await insuranceLine("not_accepted")).toBe("Insurance: Not accepted");
  });
});
