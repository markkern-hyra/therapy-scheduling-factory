const LABELS: Record<string, string> = {
  verified: "Verified",
  not_accepted: "Not accepted",
  private_pay: "Private pay",
};

// Рядок картки зі статусом перевірки страхування; немає рядка в базі (null) чи невідоме значення — «Not set».
export function insuranceLine(status: string | null): string {
  const label = status !== null && Object.hasOwn(LABELS, status) ? LABELS[status] : "Not set";
  return `Insurance: ${label}`;
}

export const INSURANCE_CHOICES = Object.entries(LABELS).map(([value, label]) => ({ value, label }));
