"use client";

import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { Dialog } from "radix-ui";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";

export const ModalTitle = Dialog.Title;

export function Modal({ children, onClose, locked = false }: { children: ReactNode; onClose: () => void; locked?: boolean }) {
  const { lifeStep } = useApp();
  const returnFocusRef = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open && !locked) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="app-modal-center fixed inset-0 z-100 grid place-items-center bg-[#111612]/60 p-5 backdrop-blur-[7px] max-[680px]:items-end max-[680px]:p-0">
          <Dialog.Content className="relative max-h-[min(90dvh,780px)] w-[min(520px,100%)] overflow-y-auto rounded-[25px] border border-border bg-background p-[38px] shadow-[0_30px_100px_rgba(0,0,0,0.28)] max-[680px]:max-h-[92dvh] max-[680px]:w-full max-[680px]:rounded-b-none max-[680px]:rounded-t-3xl max-[680px]:px-5 max-[680px]:pb-[max(24px,env(safe-area-inset-bottom))] max-[680px]:pt-[30px]" aria-describedby={undefined}
            onEscapeKeyDown={(event) => { if (locked) event.preventDefault(); }}
            onInteractOutside={(event) => { if (locked) event.preventDefault(); }}
            onOpenAutoFocus={() => { returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
            onCloseAutoFocus={(event) => { event.preventDefault(); if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus(); }}
          >
            {!locked ? <Button type="button" variant="destructive" size="icon-md" className="absolute right-3.5 top-3.5 rounded-full text-primary" aria-label={lifeStep.common.close} onClick={onClose}><X /></Button> : null}
            {children}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
