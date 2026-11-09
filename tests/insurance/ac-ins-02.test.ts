// AC-INS-02 (зріз 3): серверна дія setInsuranceStatus для планувальника — запис функцією бази, повідомлення й рядок картки.
// Мокаємо лише клієнт Supabase і next/cache: requireRole лишається справжнім. Запис у базі — tests/db/ac-ins-02.test.ts.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setInsuranceStatus } from "@/app/clients/actions";
import { messageFor } from "@/lib/scheduling/messages";
import { insuranceForm, insuranceLine, redirectTarget } from "./support";

const h = vi.hoisted(() => ({ role: "scheduler", rpc: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", async () => (await import("./support")).supabaseStub(h));

beforeEach(() => {
  h.rpc.mockReset();
  h.rpc.mockResolvedValue({ data: null, error: null });
});

describe("планувальник позначає статус", () => {
  it("AC-INS-02: scheduler1 позначає «Verified» — статус записано, картка client6 з повідомленням «Insurance status saved.»", async () => {
    h.role = "scheduler";
    const target = await redirectTarget(setInsuranceStatus(insuranceForm("card-6", "verified")));
    expect(h.rpc).toHaveBeenCalledWith("set_insurance_status", { p_client_id: "card-6", p_status: "verified" });
    expect(target).toBe("/clients/card-6?notice=INSURANCE_SAVED");
    expect(messageFor("INSURANCE_SAVED")).toBe("Insurance status saved.");
  });

  it("AC-INS-02: статус «Verified» — у картці «Insurance: Verified»", async () => {
    expect(await insuranceLine("verified")).toBe("Insurance: Verified");
  });
});
