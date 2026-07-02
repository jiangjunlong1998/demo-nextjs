import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin'
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='h-full'>{children}</div>
  );
}