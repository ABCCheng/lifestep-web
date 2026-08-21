"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({ children, onClose, labelledBy, locked = false }: { children: ReactNode; onClose: () => void; labelledBy: string; locked?: boolean }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (!locked && event.target === event.currentTarget) onClose(); }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {!locked ? <button className="modal-close" aria-label="Close" onClick={onClose}><X /></button> : null}
        {children}
      </section>
    </div>
  );
}
