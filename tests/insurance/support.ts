// Спільне для тестів AC-INS-* (зріз 3, статус перевірки страхування). Тести написано з тексту AC до реалізації, тому
// модуль зрізу 3 імпортуємо динамічно: доки його немає, червоніє тест AC, а не завантаження файлу (файл, що не
// завантажився, ховає всі тести в ньому).
import type { Mock } from "vitest";

/** Рядок картки «Insurance: …» — insuranceLine із src/lib/scheduling/insurance.ts; null — статус ще не позначено. */
export async function insuranceLine(status: string | null): Promise<string> {
  const { insuranceLine: line } = await import("@/lib/scheduling/insurance");
  return line(status);
}

/** Клієнт Supabase для серверної дії без бази: роль — з h.role (profiles, як читає requireRole), rpc — шпигун. */
export const supabaseStub = (h: { role: string; rpc: Mock }) => ({
  createClient: async () => ({
    auth: { getClaims: async () => ({ data: { claims: { sub: "user-1", email: `${h.role}1@example.test` } } }) },
    from: (table: string) =>
      table === "profiles"
        ? { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: h.role }, error: null }) }) }) }
        : {},
    rpc: h.rpc,
  }),
});

/** Поля форми статусу в картці клієнта. */
export function insuranceForm(clientId: string, status: string) {
  const form = new FormData();
  form.set("client_id", clientId);
  form.set("status", status);
  return form;
}

/** Адреса, на яку дія перенаправила (redirect кидає NEXT_REDIRECT з адресою в digest); null — без перенаправлення. */
export const redirectTarget = (action: Promise<unknown>) =>
  action.then(
    () => null,
    (e: { digest?: string }) => String(e.digest).split(";")[2],
  );
