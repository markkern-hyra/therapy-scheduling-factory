// База для тестів AC-INS-* (зріз 3): картки client6 і client7; client6 — свій клієнт therapist1 («Held» на слот через
// тиждень, як у own-clients.test.ts), client7 — ні. Що показує картка, рахуємо як побачить користувач: його запит до
// public.client_insurance під його RLS → insuranceLine; рядка немає — статус ще не позначено («Not set»).
import { insuranceLine } from "../insurance/support";
import { createTestDb, type TestDb } from "./supabase-pglite";

const HOUR = 3_600_000;

export interface InsuranceDb {
  t: TestDb;
  /** id користувача сиду за іменем: user("scheduler1"). */
  user: (name: string) => string;
  client6: string;
  client7: string;
  /** Рядки статусу, які користувач бачить у базі. */
  rows: (userId: string, clientId: string) => Promise<{ status: string }[]>;
  /** Що показує картка цьому користувачеві: «Insurance: …». */
  shown: (userId: string, clientId: string) => Promise<string>;
  /** Позначити статус функцією set_insurance_status від імені користувача. */
  mark: (userId: string, clientId: string, status: string) => Promise<unknown>;
}

export async function insuranceDb(): Promise<InsuranceDb> {
  const t = await createTestDb();
  const user = (name: string) => t.users[`${name}@example.test`];
  const [six] = await t.asService<{ id: string }>(
    `insert into public.clients (kind, full_name, email, birth_date, language)
     values ('adult', 'Client Six', 'client6@example.test', '1990-05-14', 'English') returning id`,
  );
  const [seven] = await t.asService<{ id: string }>(
    `insert into public.clients (kind, full_name, birth_date, language, guardian_name, guardian_email)
     values ('child', 'Client Seven', '2015-03-02', 'Spanish', 'Guardian Seven', 'guardian7@example.test') returning id`,
  );
  const startsAt = new Date(Date.now() + 7 * 24 * HOUR);
  startsAt.setUTCMinutes(0, 0, 0);
  const [slot] = await t.asService<{ id: string }>(
    "insert into public.slots (therapist_id, starts_at, ends_at) values ($1, $2, $3) returning id",
    [user("therapist1"), startsAt.toISOString(), new Date(startsAt.getTime() + HOUR).toISOString()],
  );
  await t.asUser(user("scheduler1"), "insert into public.holds (slot_id, client_id) values ($1, $2)", [slot.id, six.id]);

  const rows = (userId: string, clientId: string) =>
    t.asUser<{ status: string }>(userId, "select status from public.client_insurance where client_id = $1", [clientId]);
  return {
    t,
    user,
    client6: six.id,
    client7: seven.id,
    rows,
    shown: async (userId, clientId) => insuranceLine((await rows(userId, clientId))[0]?.status ?? null),
    mark: (userId, clientId, status) =>
      t.asUser(userId, "select public.set_insurance_status($1, $2)", [clientId, status]),
  };
}
