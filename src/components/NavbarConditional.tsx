'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';

/** Renders the top Navbar on every page except the home page `/`. */
export default function NavbarConditional() {
    const pathname = usePathname();
    if (pathname === '/') return null;
    return <Navbar />;
}
