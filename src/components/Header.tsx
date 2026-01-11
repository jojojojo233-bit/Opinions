import { Search } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

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

          <div className="flex-shrink-0">
             <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  );
}
