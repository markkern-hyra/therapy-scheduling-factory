// AC-INS-02 (зріз 3): scheduler1 позначає «Verified» функцією set_insurance_status — статус збережено в базі.
// Повідомлення «Insurance status saved.» — у tests/insurance/ac-ins-02.test.ts.
import { beforeAll, describe, expect, it } from "vitest";
import { insuranceDb, type InsuranceDb } from "./insurance-db";

let db: InsuranceDb;
let scheduler1: string;

beforeAll(async () => {
  db = await insuranceDb();
  scheduler1 = db.user("scheduler1");
}, 60_000);

describe("планувальник позначає статус", () => {
  it("AC-INS-02: scheduler1 позначає «Verified» — картка client6 показує «Insurance: Verified» і після повторного відкриття", async () => {
    expect(await db.shown(scheduler1, db.client6)).toBe("Insurance: Not set");
    await db.mark(scheduler1, db.client6, "verified");
    // Кожен запит asUser — окрема транзакція: так scheduler1 відкриває картку знову.
    expect(await db.shown(scheduler1, db.client6)).toBe("Insurance: Verified");
  });

  // Припущення PM: «Not set» лише початковий. Окрема картка client7 — щоб тести не залежали від порядку.
  it("AC-INS-02: повернути «Not set» не можна — ні значенням not_set, ні видаленням; картка й далі «Insurance: Verified»", async () => {
    await db.mark(scheduler1, db.client7, "verified");
    await expect(db.mark(scheduler1, db.client7, "not_set")).rejects.toMatchObject({ code: "23514" });
    // Відмова видалення — будь-яка (немає grant чи політики): важить лише те, що статус лишився.
    await db.t.asUser(scheduler1, "delete from public.client_insurance where client_id = $1", [db.client7]).catch(() => []);
    expect(await db.shown(scheduler1, db.client7)).toBe("Insurance: Verified");
  });
});
