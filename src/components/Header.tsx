import { Search, User } from 'lucide-react';

interface HeaderProps {
  onAuthClick: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  isLoggedIn: boolean;
}

export function Header({ onAuthClick, onSearch, searchQuery, isLoggedIn }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Top Left */}
          <div className="flex items-center gap-0.5">
            <img 
              src='src/components/ui/Images/logo.png' 
              alt="Opinions Logo" 
              className="h-8 w-3 object-contain object-left" 
            />
            <h1 className="text-2xl font-bold text-purple-600">Opinions</h1>
          </div>
          {/* Search Bar - Middle Top */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Search polls"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Login/Sign Up - Top Right */}
          <div className="flex-shrink-0">
            <button
              onClick={onAuthClick}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              {isLoggedIn ? 'Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
