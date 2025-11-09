import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu } from 'lucide-react';

export default function Header({ isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h2 className="text-lg font-semibold text-foreground">Welcome back!</h2>
            <p className="text-sm text-muted-foreground">{user?.company}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-foreground">{user?.email}</div>
              <div className="text-muted-foreground capitalize">{user?.plan} Plan</div>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-accent">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
