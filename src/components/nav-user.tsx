import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { LogOutIcon, ShieldIcon, UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logoutFn } from '@/server/auth';
import { AuthUser } from '@/server/session';

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return 'System Admin';
    case 'KABALE_ADMIN':
      return 'Kabale Admin';
    case 'CITIZEN':
      return 'Citizen';
    default:
      return role;
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return 'destructive' as const;
    case 'KABALE_ADMIN':
      return 'default' as const;
    case 'CITIZEN':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
};

export function NavUser({ user }: { user: AuthUser }) {
  const logoutMutation = useServerFn(logoutFn);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer rounded-lg">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-2 py-1.5">
          <div className="flex items-center gap-2">
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">
              <UserIcon />
              Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logoutMutation({})}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
