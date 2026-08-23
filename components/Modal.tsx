"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({ children, onClose, labelledBy, locked = false }: { children: ReactNode; onClose: () => void; labelledBy: string; locked?: boolean }) {
  return (
    <div className="fixed inset-0 z-100 grid place-items-center bg-[#111612]/60 p-5 backdrop-blur-[7px] max-[680px]:items-end max-[680px]:p-0" role="presentation" onMouseDown={(event) => { if (!locked && event.target === event.currentTarget) onClose(); }}>
      <section className="relative max-h-[min(90dvh,780px)] w-[min(520px,100%)] overflow-y-auto rounded-[25px] border border-border bg-background p-[38px] shadow-[0_30px_100px_rgba(0,0,0,0.28)] max-[680px]:max-h-[92dvh] max-[680px]:w-full max-[680px]:rounded-b-none max-[680px]:rounded-t-3xl max-[680px]:px-5 max-[680px]:pb-[max(24px,env(safe-area-inset-bottom))] max-[680px]:pt-[30px]" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {!locked ? <button className="absolute right-3.5 top-3.5 grid size-[38px] cursor-pointer place-items-center rounded-full bg-secondary" aria-label="Close" onClick={onClose}><X /></button> : null}
        {children}
      </section>
    </div>
  );
}
