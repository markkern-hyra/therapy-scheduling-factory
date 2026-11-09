// AC-INS-05 (зріз 3): терапевт напряму, оминаючи сторінки (функція чи таблиця через Data API), статус не змінює.
// Правило живе в базі (grant, RLS, security invoker), тож і доказ — тут; спроба через серверну дію —
// tests/insurance/ac-ins-05.test.ts.
import { beforeAll, describe, expect, it } from "vitest";
import { insuranceDb, type InsuranceDb } from "./insurance-db";

let db: InsuranceDb;
let scheduler1: string;
let therapist1: string;

beforeAll(async () => {
  db = await insuranceDb();
  scheduler1 = db.user("scheduler1");
  therapist1 = db.user("therapist1");
}, 60_000);

describe("терапевт не змінює статус в обхід сторінок", () => {
  it.each([
    { how: "функцією set_insurance_status", sql: "select public.set_insurance_status($1, 'verified')" },
    { how: "update таблиці", sql: "update public.client_insurance set status = 'verified' where client_id = $1" },
    {
      how: "insert … on conflict",
      sql: `insert into public.client_insurance (client_id, status) values ($1, 'verified')
            on conflict (client_id) do update set status = excluded.status`,
    },
    { how: "delete рядка", sql: "delete from public.client_insurance where client_id = $1" },
  ])("AC-INS-05: therapist1 напряму ($how) не змінює «Not accepted» client6 — scheduler1 бачить «Insurance: Not accepted»", async ({ sql }) => {
    await db.mark(scheduler1, db.client6, "not_accepted");
    expect(await db.shown(therapist1, db.client6)).toBe("Insurance: Not accepted");
    // Відмова бази буває різна (grant, RLS, 0 рядків): з AC важить лише те, що статус не змінився.
    await db.t.asUser(therapist1, sql, [db.client6]).catch(() => []);
    expect(await db.shown(scheduler1, db.client6)).toBe("Insurance: Not accepted");
  });
});
