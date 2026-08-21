import Link from "next/link";

export function Brand({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} className="brand" aria-label="LifeStep home">
      {/* The bitmap logo keeps the bold red silhouette used across the EffortGo family. */}
      <img src="/logo.svg" alt="" width={44} height={44} />
      {!compact ? <span>LifeStep</span> : null}
    </Link>
  );
}
