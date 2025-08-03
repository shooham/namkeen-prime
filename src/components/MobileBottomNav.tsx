import React from 'react';
import { Home, Play, Search, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MobileBottomNavProps {
  isAuthenticated?: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ isAuthenticated = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Play, label: 'Series', path: '/series' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: User, label: 'Profile', path: isAuthenticated ? '/profile' : '/auth' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary/95 backdrop-blur-sm border-t border-border-standard md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 ${
              isActive(path)
                ? 'text-primary-green'
                : 'text-text-secondary hover:text-primary-green'
            }`}
          >
            <Icon 
              className={`h-5 w-5 mb-1 transition-all duration-300 ${
                isActive(path) 
                  ? 'drop-shadow-[0_0_8px_var(--accent-glow)]' 
                  : ''
              }`} 
            />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;