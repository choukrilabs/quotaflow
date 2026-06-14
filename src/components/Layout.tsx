import { ReactNode } from 'react';
import Navigation from './Navigation';
import ToastContainer from './ToastContainer';

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export default function Layout({ children, showNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {showNav && <Navigation />}
      <main>{children}</main>
      <ToastContainer />
    </div>
  );
}
