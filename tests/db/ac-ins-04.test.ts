// AC-INS-04 (зріз 3): терапевт бачить статус у картці свого клієнта — і лише свого (межа «свій клієнт», обидва боки).
// «Змінити йому не запропоновано» — вигляд сторінки (e2e); спроба в обхід сторінок — AC-INS-05.
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

describe("терапевт бачить статус свого клієнта", () => {
  it("AC-INS-04: client6 — свій клієнт therapist1 зі статусом «Not accepted» — therapist1 бачить «Insurance: Not accepted»", async () => {
    await db.mark(scheduler1, db.client6, "not_accepted");
    expect(await db.shown(therapist1, db.client6)).toBe("Insurance: Not accepted");
  });

  it("AC-INS-04: client7 — не свій клієнт therapist1 — його статусу therapist1 не бачить, scheduler1 бачить", async () => {
    await db.mark(scheduler1, db.client7, "not_accepted");
    expect(await db.rows(therapist1, db.client7)).toEqual([]);
    expect(await db.shown(scheduler1, db.client7)).toBe("Insurance: Not accepted");
  });
});
