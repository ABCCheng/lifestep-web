export const journeyIntroClass =
  "app-shell-width flex items-end justify-between gap-6 pb-[25px] pt-11 max-[680px]:items-start max-[680px]:pb-[18px] max-[680px]:pt-7 [&_h1]:my-1.5 [&_h1]:text-[clamp(2.3rem,5vw,4rem)] [&_h1]:tracking-[-0.065em] max-[680px]:[&_h1]:text-[2.45rem] [&>div>p:last-child]:m-0 [&>div>p:last-child]:text-[#68736d] max-[680px]:[&>div>p:last-child]:text-[0.8rem]";

export const journeySwitchClass =
  "flex cursor-pointer items-center gap-2 rounded-xl border border-[#1d242024] bg-white/70 px-3.5 py-2.5 text-[0.78rem] font-bold text-[#4d5a52] max-[680px]:size-[42px] max-[680px]:justify-center max-[680px]:p-0 max-[680px]:text-[0]";

export const journeyMapClass =
  "app-shell-width relative isolate mb-[45px] min-h-[1500px] overflow-hidden rounded-[30px] border border-[#1d242014] bg-[#dfeadd] pb-[120px] pt-[55px] before:absolute before:-bottom-[60px] before:-left-[10%] before:-right-[10%] before:-z-1 before:h-[27%] before:rounded-t-[50%] before:bg-[#c5dcc5] before:content-[''] dark:bg-[#203226] dark:before:bg-[#2b4433] max-[680px]:min-h-[1420px] max-[680px]:rounded-[22px] max-[680px]:pt-[45px]";

export const routeSpineClass =
  "absolute bottom-[145px] left-1/2 top-[100px] w-2 -translate-x-1/2 rounded-[20px] bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,.95)_0_14px,transparent_14px_24px)] opacity-90 max-[680px]:left-[35px] max-[680px]:translate-x-0";

export const mapCloudClass =
  "absolute h-5 w-[70px] rounded-[30px] bg-white/80 before:absolute before:bottom-0 before:left-2.5 before:size-[30px] before:rounded-full before:bg-[inherit] before:content-[''] after:absolute after:bottom-0 after:right-[7px] after:size-10 after:rounded-full after:bg-[inherit] after:content-['']";

export const mountainsClass =
  "absolute left-[2%] top-[6%] flex items-end max-[680px]:origin-top-left max-[680px]:scale-70 max-[680px]:opacity-45 [&>span]:-mr-[45px] [&>span]:size-0 [&>span]:border-x-[60px] [&>span]:border-b-[110px] [&>span]:border-x-transparent [&>span]:border-b-[#a8c4a8] [&>span:nth-child(2)]:border-x-[80px] [&>span:nth-child(2)]:border-b-[150px] [&>span:nth-child(2)]:border-b-[#96b897] [&>span:nth-child(3)]:border-b-[#b5cdb4]";

export const stopRowClasses = [
  "-translate-x-[16%] max-[900px]:-translate-x-[10%]",
  "translate-x-[9%] max-[900px]:translate-x-[7%]",
  "translate-x-[18%] max-[900px]:translate-x-[10%]",
  "-translate-x-[7%] max-[900px]:-translate-x-[5%]",
] as const;

export const journeyStopBaseClass =
  "relative grid min-h-[82px] w-[min(370px,70vw)] cursor-pointer grid-cols-[54px_1fr] items-center gap-3 rounded-[19px] border border-[#1d242021] bg-white/85 py-2.5 pl-2.5 pr-[18px] text-left text-[#1d2420] shadow-[0_9px_24px_rgba(37,58,45,.09)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_30px_rgba(37,58,45,.15)] max-[680px]:ml-[34px] max-[680px]:w-[calc(100%-34px)] max-[680px]:grid-cols-[48px_1fr] max-[680px]:pr-2.5";

export const journeyChoiceButtonClass =
  "grid min-h-[82px] cursor-pointer grid-cols-[48px_1fr_auto] items-center gap-3 rounded-[15px] border border-border bg-card p-3 text-left hover:border-primary hover:bg-primary/5 [&>span:first-child]:grid [&>span:first-child]:size-12 [&>span:first-child]:place-items-center [&>span:first-child]:rounded-[13px] [&>span:first-child]:bg-primary/10 [&>span:first-child]:text-primary [&>div]:grid [&>div]:gap-1 [&_small]:text-[0.7rem] [&_small]:text-muted-foreground [&>svg]:text-primary";

export const modalHeadingClass =
  "mt-1.5 text-[2rem] tracking-[-0.05em] max-[680px]:text-[1.8rem]";
