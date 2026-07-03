import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-200 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`absolute inset-x-0 bottom-0 mx-auto max-w-[480px] rounded-t-[24px] border border-b-0 border-border bg-surface-alt shadow-2xl transition-transform duration-200 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)" }}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border" />
        <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-4">
          {title && (
            <h2 className="font-display text-[20px] font-black text-foreground">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-background text-muted-foreground"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 pb-8 pt-2">{children}</div>
      </div>
    </div>
  );
}
