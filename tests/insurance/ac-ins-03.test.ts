// AC-INS-03 (зріз 3): серверна дія setInsuranceStatus для адміністратора і рядок «Private pay». Що бачить scheduler2 після
// зміни — tests/db/ac-ins-03.test.ts.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setInsuranceStatus } from "@/app/clients/actions";
import { insuranceForm, insuranceLine, redirectTarget } from "./support";

const h = vi.hoisted(() => ({ role: "admin", rpc: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", async () => (await import("./support")).supabaseStub(h));

beforeEach(() => {
  h.rpc.mockReset();
  h.rpc.mockResolvedValue({ data: null, error: null });
});

describe("адміністратор змінює статус", () => {
  it("AC-INS-03: admin1 змінює статус client7 на «Private pay» — статус записано, картка client7 з повідомленням про збереження", async () => {
    h.role = "admin";
    const target = await redirectTarget(setInsuranceStatus(insuranceForm("card-7", "private_pay")));
    expect(h.rpc).toHaveBeenCalledWith("set_insurance_status", { p_client_id: "card-7", p_status: "private_pay" });
    expect(target).toBe("/clients/card-7?notice=INSURANCE_SAVED");
  });

  it("AC-INS-03: статус «Private pay» — у картці «Insurance: Private pay»", async () => {
    expect(await insuranceLine("private_pay")).toBe("Insurance: Private pay");
  });
});
