export default function Badge({ children, classes = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${classes}`}
    >
      {children}
    </span>
  );
}
