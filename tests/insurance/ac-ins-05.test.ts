// AC-INS-05 (зріз 3): терапевт надсилає серверну дію setInsuranceStatus напряму, без кнопки на сторінці. Справжня перевірка
// ролі (requireRole) — до запису; спроба в обхід застосунку (функція й таблиця) — tests/db/ac-ins-05.test.ts.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setInsuranceStatus } from "@/app/clients/actions";
import { insuranceForm, redirectTarget } from "./support";

const h = vi.hoisted(() => ({ role: "therapist", rpc: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", async () => (await import("./support")).supabaseStub(h));

beforeEach(() => {
  h.rpc.mockReset();
  h.rpc.mockResolvedValue({ data: null, error: null });
});

describe("терапевт не змінює статус в обхід сторінок", () => {
  it("AC-INS-05: therapist1 надсилає «Verified» для client6 напряму — без запису й повідомлення, назад на картку client6", async () => {
    h.role = "therapist";
    const target = await redirectTarget(setInsuranceStatus(insuranceForm("card-6", "verified")));
    expect(h.rpc).not.toHaveBeenCalled();
    expect(target).toBe("/clients/card-6");
  });
});
