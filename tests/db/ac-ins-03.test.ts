// AC-INS-03 (зріз 3): адміністратор змінює статус, і його бачить інший планувальник.
import { beforeAll, describe, expect, it } from "vitest";
import { insuranceDb, type InsuranceDb } from "./insurance-db";

let db: InsuranceDb;

beforeAll(async () => {
  db = await insuranceDb();
}, 60_000);

describe("адміністратор змінює статус", () => {
  it("AC-INS-03: admin1 змінює «Verified» client7 на «Private pay» — і admin1, і scheduler2 бачать «Insurance: Private pay»", async () => {
    await db.mark(db.user("scheduler1"), db.client7, "verified");
    expect(await db.shown(db.user("scheduler2"), db.client7)).toBe("Insurance: Verified");
    await db.mark(db.user("admin1"), db.client7, "private_pay");
    expect(await db.shown(db.user("admin1"), db.client7)).toBe("Insurance: Private pay");
    expect(await db.shown(db.user("scheduler2"), db.client7)).toBe("Insurance: Private pay");
  });
});
