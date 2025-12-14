import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50 py-8">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Kabale Digital ID System. All rights reserved.
          </p>
        </div>
        <p className="text-muted-foreground text-sm">Official City Authority Digital Identity Platform</p>
      </div>
    </div>
  </footer>
  )
}
