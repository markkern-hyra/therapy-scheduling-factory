// AC-INS-01 (зріз 3): статус перевірки страхування, який ще ніхто не позначав, — «Insurance: Not set».
import { beforeAll, describe, expect, it } from "vitest";
import { insuranceDb, type InsuranceDb } from "./insurance-db";

let db: InsuranceDb;

beforeAll(async () => {
  db = await insuranceDb();
}, 60_000);

describe("статус страхування ще не позначено", () => {
  it("AC-INS-01: картку client6 створено, статус ніхто не позначав — scheduler1 бачить «Insurance: Not set»", async () => {
    const scheduler1 = db.user("scheduler1");
    // Статус іншої картки на client6 не переходить.
    await db.mark(scheduler1, db.client7, "verified");
    expect(await db.shown(scheduler1, db.client6)).toBe("Insurance: Not set");
  });
});
