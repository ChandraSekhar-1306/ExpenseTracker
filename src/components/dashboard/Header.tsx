
'use client';

import { BookCopy, Menu, LogOut, User as UserIcon, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';

export function Header() {
  const isMobile = useIsMobile();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="flex items-center justify-between gap-4 p-4 h-16 sm:px-6 md:px-8 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 bg-primary/10 rounded-lg">
          <svg
            className="h-7 w-7 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          ExpenseFlow
        </h1>
      </Link>
      
      <div className="flex items-center gap-2">
        {!isMobile && (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/trends">
              <TrendingUp className="mr-2 h-4 w-4" />
              Trends & Insights
            </Link>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={isMobile ? 'icon' : 'default'} className={cn("group", isMobile ? "h-9 w-9" : "h-auto p-0", !isMobile && "hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0")}>
              {isMobile ? (
                  <Menu className="h-6 w-6" />
              ) : (
                <Avatar className="h-9 w-9 transition-transform group-hover:scale-105">
                  <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'}/>
                  <AvatarFallback className="transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {getInitials(user?.displayName)}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user && (
              <>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href="/monthly-report" className="flex items-center gap-2">
                <BookCopy className="mr-2 h-4 w-4" />
                <span>Monthly Report</span>
              </Link>
            </DropdownMenuItem>
             {isMobile && (
              <DropdownMenuItem asChild>
                <Link href="/trends" className="flex items-center gap-2">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>Trends & Insights</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
