import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72 h-full">
                <div className="fixed top-0 right-0 left-0 md:left-72 z-50 h-16">
                    <Header />
                </div>
                <div className="pt-20 px-8 h-full bg-slate-50 dark:bg-slate-900">
                    {children}
                </div>
            </main>
        </div>
    );
}
