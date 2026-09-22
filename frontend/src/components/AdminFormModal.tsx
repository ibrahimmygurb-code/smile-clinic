"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type AdminFormModalProps = {
  open: boolean;
  title: string;
  description?: string;
  wide?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function AdminFormModal({
  open,
  title,
  description,
  wide = false,
  onClose,
  children,
}: AdminFormModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => {
      const field = panelRef.current?.querySelector<HTMLElement>(
        "input:not([type='hidden']):not([readonly]), textarea, select",
      );
      field?.focus({ preventScroll: true });
    }, 40);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <button type="button" className="admin-modal__backdrop" aria-label="إغلاق النافذة" onClick={onClose} />
      <div ref={panelRef} className={`admin-modal__panel dental-card ${wide ? "admin-modal__panel--wide" : ""}`}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="admin-modal-title" className="text-lg font-bold text-foreground">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-sm font-semibold text-muted hover:text-foreground">
            إغلاق
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
