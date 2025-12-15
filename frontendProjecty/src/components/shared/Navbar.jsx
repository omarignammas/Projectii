import { Link, useNavigate } from 'react-router-dom'
import { LogOut, FolderKanban, BadgeCheckIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ModeToggle } from '../ui/mode-toggle'
import { useAuth } from '../../hooks/useAuth'

export const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="
      border-b
      font-mono
      bg-white text-blue-500
      dark:bg-slate-950 dark:text-zinc-100
    ">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          <Link
            to="/dashboard"
            className="
              flex items-center gap-2 text-xl font-bold
              text-blue-600
              dark:text-blue-400
            "
          >
            <FolderKanban className="h-6 w-6" />
            <span>Projectii</span>
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <Badge
                  variant="outline"
                  className="
                    text-blue-500 border-blue-300  h-9
                    dark:text-blue-300 dark:border-blue-600
                  "
                >
                  {user.firstName} {user.lastName}
                  <BadgeCheckIcon className="ml-2 w-5 h-5" />
                </Badge>

                <ModeToggle className="w-5 h-5"/>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="
                    text-rose-500 h-9
                    hover:text-red-700
                    dark:text-rose-400 dark:hover:text-red-500
                  "
                >
                  <LogOut className="h-5 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
