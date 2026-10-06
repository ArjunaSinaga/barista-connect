import BottomNav from "@/components/layout/BottomNav";

export default function AcademyDashboardLayout({ children }) {
  return (
    <div className="pb-16 md:pb-0">
      {children}
      <BottomNav role="academy" />
    </div>
  );
}
