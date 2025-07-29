'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, MapIcon, PlusCircle, User, Briefcase, LogOut } from 'lucide-react';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';


const RoaditLogo = () => (
    <svg
        viewBox="0 0 160 40"
        width="120"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g transform="translate(5, 5)">
            <rect width="150" height="30" fill="white" />
            <path
                d="M31.65,24.93c-2.43-1.49-4.3-3.69-5.3-6.23a10.2,10.2,0,0,1-.13-7.25,9.6,9.6,0,0,1,3.42-4.69,8.7,8.7,0,0,1,5-1.76,8.89,8.89,0,0,1,5.08,1.76,9.45,9.45,0,0,1,3.41,4.69,10.08,10.08,0,0,1,0,7.25,9.75,9.75,0,0,1-3.29,4.68,8.83,8.83,0,0,1-5.08,1.76,9,9,0,0,1-3.11-.56Z"
                fill="#4285F4"
            />
            <path
                d="M36.1,17.2a1.4,1.4,0,0,0,1.15-.81,1.52,1.52,0,0,0,0-1.48,1.4,1.4,0,0,0-1.15-.82,1.42,1.42,0,0,0-1.46,0,1.4,1.4,0,0,0-1.15.82,1.52,1.52,0,0,0,0,1.48,1.4,1.4,0,0,0,1.15.81,1.42,1.42,0,0,0,1.46,0Z"
                fill="#fff"
            />
            <path
                d="M39.6,12.5a1.45,1.45,0,0,0,.68-1.25,1.38,1.38,0,0,0-1-1.16,1.41,1.41,0,0,0-1.55.33,1.51,1.51,0,0,0-.56,1.32,1.47,1.47,0,0,0,.56,1.32,1.41,1.41,0,0,0,1.55.33,1.38,1.38,0,0,0,1-1.16A1.45,1.45,0,0,0,39.6,12.5Z"
                fill="#fff"
            />
            <path
                d="M40.24,19.34a1.4,1.4,0,0,0,.32-1.54,1.47,1.47,0,0,0-1.31-.91,1.43,1.43,0,0,0-1.24.67,1.4,1.4,0,0,0-.32,1.54,1.47,1.47,0,0,0,1.31.91,1.43,1.43,0,0,0,1.24-.67Z"
                fill="#fff"
            />
            <path
                d="M32,19.34a1.43,1.43,0,0,0,1.24.67,1.47,1.47,0,0,0,1.31-.91,1.4,1.4,0,0,0-.32-1.54,1.43,1.43,0,0,0-1.24-.67,1.47,1.47,0,0,0-1.31.91,1.4,1.4,0,0,0,.32,1.54Z"
                fill="#fff"
            />
            <path
                d="M32.65,12.5a1.38,1.38,0,0,0-1-1.16,1.41,1.41,0,0,0-1.55.33,1.47,1.47,0,0,0-.56,1.32,1.51,1.51,0,0,0,.56,1.32,1.41,1.41,0,0,0,1.55.33,1.38,1.38,0,0,0,1-1.16A1.45,1.45,0,0,0,32.65,12.5Z"
                fill="#fff"
            />
            <text x="55" y="25" fontFamily="PT Sans, sans-serif" fontSize="24" fontWeight="bold" fill="#202124">Road<tspan fill="#4285F4">it</tspan></text>
        </g>
    </svg>
);


export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage only on the client side
    if (typeof window !== 'undefined') {
      setUserRole(localStorage.getItem('userRole'));
    }
  }, [pathname]); // Rerun when path changes to reflect login/logout

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: MapIcon },
    { href: '/report', label: 'Report Issue', icon: PlusCircle },
    { href: '/stats', label: 'Statistics', icon: BarChart3 },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <RoaditLogo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton 
                  isActive={pathname === item.href} 
                  tooltip={item.label}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
           {!userRole ? (
             <>
                <SidebarMenuItem>
                    <Link href="/municipal-login">
                        <SidebarMenuButton tooltip="Municipal Login" isActive={pathname === '/municipal-login'}>
                            <Briefcase className="h-5 w-5" />
                            <span>Municipal Login</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/login">
                    <SidebarMenuButton tooltip="Civilian Login" isActive={pathname === '/login'}>
                    <User className="h-5 w-5" />
                    <span>Civilian Login</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
             </>
           ) : (
             <SidebarMenuItem>
                <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
           )}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
