import SideNav from '@/app/ui/admin/sidenav';
import { Metadata } from 'next';
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: 'Admin'
}

export default async function Layout({ children, params }: { children: React.ReactNode, params: Promise<{store: string}> }) {
  const { store } = await params
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav currentStore={store}/>
      </div>
      <div className="grow p-6 h-full md:p-12 overflow-hidden flex flex-col min-h-0">{children}</div>
      <Toaster position="top-center" richColors />
    </div>
  );
}