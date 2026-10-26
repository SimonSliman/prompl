import Link from "next/link";

export function Wordmark({ dark = false, size = 20 }: { dark?: boolean; size?: number }) {
  return (
    <Link
      href="/"
      className="font-heading font-bold tracking-[-0.02em] no-underline"
      style={{ fontSize: size, color: dark ? "#FFFFFF" : "var(--ink)" }}
    >
      smallroom
    </Link>
  );
}
