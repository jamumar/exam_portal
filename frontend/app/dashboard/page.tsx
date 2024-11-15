import { LayoutComponent } from "@/components/layout"
import StudentDashboard from "@/components/student-dashboard";

export default function Page() {
  return (
    <LayoutComponent>
      <StudentDashboard/>
    </LayoutComponent>
  );
}