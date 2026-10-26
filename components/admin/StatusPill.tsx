export function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    requested: "#EEF1FD", recruiting: "#FFF4D6", confirmed: "#E3F5EA", done: "#ECEDEA", cancelled: "#FDE8E8",
    draft: "#ECEDEA", invited: "#EEF1FD", accepted: "#E3F5EA", declined: "#FDE8E8", waitlist: "#FFF4D6", attended: "#E3F5EA", no_show: "#FDE8E8",
  };
  return (
    <span className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: colors[status] ?? "#ECEDEA" }}>
      {status.replace("_", " ")}
    </span>
  );
}
