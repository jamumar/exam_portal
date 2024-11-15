import { LayoutComponent } from "@/components/layout"
import { Home as HomeComponent } from "@/components/home";

export default function Home() {
  return (
    <LayoutComponent>
      <HomeComponent/>
    </LayoutComponent>
  );
}