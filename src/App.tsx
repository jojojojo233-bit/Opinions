import { useState } from 'react';
import { Header } from './components/Header';
import { Categories } from './components/Categories';
import { PollGrid } from './components/PollGrid';
import { AddPollButton } from './components/AddPollButton';
import { AuthModal } from './components/AuthModal';
import { CreatePollModal } from './components/CreatePollModal';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAuthClick={() => setIsAuthModalOpen(true)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        isLoggedIn={isLoggedIn}
      />
      
      <Categories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PollGrid
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </main>

      <AddPollButton onClick={() => setIsCreatePollModalOpen(true)} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setIsAuthModalOpen(false);
        }}
      />

      <CreatePollModal
        isOpen={isCreatePollModalOpen}
        onClose={() => setIsCreatePollModalOpen(false)}
      />
    </div>
  );
}
