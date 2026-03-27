import HeaderComponent from "@/components/ui/HeaderComponent/HeaderComponent";
import SidebarComponent from "@/components/ui/SidebarComponent/SidebarComponent";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-screen overflow-hidden">
      <SidebarComponent />
      <main className=" w-full">
        <HeaderComponent />

        <div className="overflow-y-auto p-4">{children}</div>
      </main>
    </section>
  );
}
