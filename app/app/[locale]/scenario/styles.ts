export const learningProgressClass =
  "app-content-width sticky top-[72px] z-20 grid grid-cols-4 bg-[color-mix(in_srgb,var(--background)_94%,transparent)] py-[17px] backdrop-blur-[15px] before:absolute before:left-[12.5%] before:right-[12.5%] before:top-[35px] before:h-0.5 before:bg-border before:content-[''] max-[680px]:top-16 max-[680px]:py-3 max-[680px]:before:top-[29px]";

export const learningStepClass =
  "relative z-1 grid cursor-pointer justify-items-center gap-2 bg-transparent text-muted-foreground [&>span]:grid [&>span]:size-[38px] [&>span]:place-items-center [&>span]:rounded-full [&>span]:border-2 [&>span]:border-border [&>span]:bg-background max-[680px]:[&>span]:size-[34px] [&>small]:text-[0.69rem] [&>small]:font-bold max-[680px]:[&>small]:text-[0.57rem]";

export const contentTitleClass =
  "mb-7 flex items-center gap-[18px] max-[680px]:items-start [&>span]:grid [&>span]:size-[62px] [&>span]:shrink-0 [&>span]:place-items-center [&>span]:rounded-[19px] [&>span]:bg-primary/10 [&>span]:text-primary max-[680px]:[&>span]:size-12 max-[680px]:[&>span]:rounded-[15px] [&>span>svg]:size-7 [&_h2]:mb-0 [&_h2]:mt-1 [&_h2]:text-[2rem] [&_h2]:tracking-[-0.05em] max-[680px]:[&_h2]:text-2xl";

export const conversationPhoneClass =
  "mx-auto max-w-[700px] overflow-hidden rounded-[22px] border border-border bg-[#e8ede9] text-[#1d2420] shadow-[var(--shadow)] max-[680px]:-mx-[3px] max-[680px]:rounded-[17px]";

export const messageBubbleClass =
  "grid max-w-[76%] gap-1 rounded-bl-2xl rounded-br-2xl rounded-tl-[5px] rounded-tr-2xl bg-white px-3.5 py-3 shadow-[0_3px_10px_rgba(0,0,0,.05)] max-[680px]:max-w-[88%] [&_strong]:text-[0.9rem] [&_strong]:leading-[1.45] [&_em]:text-[0.72rem] [&_em]:not-italic [&_em]:text-[#657069] [&_small]:flex [&_small]:items-center [&_small]:gap-1 [&_small]:text-[0.58rem] [&_small]:text-primary";

export const reviewPhraseClass =
  "mb-2 grid w-full cursor-pointer grid-cols-[34px_1fr_auto] items-center gap-2.5 rounded-[13px] border border-border bg-card p-3.5 text-left [&>span]:text-muted-foreground [&>svg]:text-primary";
