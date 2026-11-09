import type { ReactNode } from "react";
import { AlertIcon } from "./icons";

// Повідомлення над формою чи списком, текст AC дослівно. error (типово): м'яке тло destructive-soft, іконка, role="alert".
// success: тло primary-soft і текст card-foreground, role="status", без іконки помилки.
export function Alert({ children, variant = "error" }: { children: ReactNode; variant?: "error" | "success" }) {
  if (variant === "success") {
    return (
      <p role="status" className="rounded-md bg-primary-soft px-4 py-3 text-sm text-card-foreground">
        {children}
      </p>
    );
  }
  return (
    <p role="alert" className="flex items-start gap-2 rounded-md bg-destructive-soft px-4 py-3 text-sm text-destructive">
      <AlertIcon />
      <span>{children}</span>
    </p>
  );
}
