import { Link } from '@tanstack/react-router'
import { Shield } from 'lucide-react'
import { AuthUser } from '@/server/session'
import { NavUser } from './nav-user'
import { Button } from './ui/button'

export default function Header({ user }: { user: AuthUser | null }) {
 
  return (
    <header className="border-b bg-card">
        <div className="container mx-auto flex h-12 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-semibold text-xl">Kabale Digital ID</h1>
          </Link>
          {user?(
           <NavUser user={user} />
          ):(
            <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
            <Link to="/register">Register as Citizen</Link>
            </Button>
            </nav>
          )}
        </div>
      </header>
  )
}
