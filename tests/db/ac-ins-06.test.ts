// AC-INS-06 (зріз 3): без входу статусу й даних картки не прочитати й не змінити. Перенаправлення на сторінку входу
// (proxy, requireRole) — AC-CARD-07; що на сторінці лише форма входу — e2e.
import { beforeAll, describe, expect, it } from "vitest";
import { insuranceDb, type InsuranceDb } from "./insurance-db";

let db: InsuranceDb;
let scheduler1: string;

beforeAll(async () => {
  db = await insuranceDb();
  scheduler1 = db.user("scheduler1");
}, 60_000);

describe("без входу статусу не видно", () => {
  it("AC-INS-06: відвідувач без входу не читає й не змінює статус «Verified» client6 — scheduler1 після цього бачить «Insurance: Verified»", async () => {
    await db.mark(scheduler1, db.client6, "verified");
    const anon = (sql: string) => db.t.asAnon(sql, [db.client6]);
    await expect(anon("select status from public.client_insurance where client_id = $1")).rejects.toThrow(
      /permission denied for table client_insurance/,
    );
    await expect(anon("select full_name from public.clients where id = $1")).rejects.toThrow(
      /permission denied for table clients/,
    );
    await expect(anon("select public.set_insurance_status($1, 'not_accepted')")).rejects.toThrow(
      /permission denied for function set_insurance_status/,
    );
    await expect(
      anon("update public.client_insurance set status = 'not_accepted' where client_id = $1"),
    ).rejects.toThrow(/permission denied for table client_insurance/);
    await expect(
      anon("insert into public.client_insurance (client_id, status) values ($1, 'not_accepted')"),
    ).rejects.toThrow(/permission denied for table client_insurance/);
    expect(await db.shown(scheduler1, db.client6)).toBe("Insurance: Verified");
  });
});
