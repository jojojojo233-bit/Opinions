import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Categories } from './components/Categories';
import { PollGrid, PollData } from './components/PollGrid';
import { AddPollButton } from './components/AddPollButton';
import { CreatePollModal } from './components/CreatePollModal';

export default function App() {
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [localPolls, setLocalPolls] = useState<PollData[]>([]);

  useEffect(() => {
    // Load local polls from storage on mount
    const saved = localStorage.getItem('opinions_polls');
    if (saved) {
        try {
            setLocalPolls(JSON.parse(saved));
        } catch(e) { console.error("Failed to load local polls"); }
    }
  }, []);

  const handlePollCreated = (newPoll: PollData) => {
      const updated = [newPoll, ...localPolls];
      setLocalPolls(updated);
      localStorage.setItem('opinions_polls', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAuthClick={() => {}} 
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        isLoggedIn={false} 
      />
      
      <Categories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PollGrid
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          extraPolls={localPolls}
        />
      </main>

      <AddPollButton onClick={() => setIsCreatePollModalOpen(true)} />

      <CreatePollModal
        isOpen={isCreatePollModalOpen}
        onClose={() => setIsCreatePollModalOpen(false)}
        onPollCreated={handlePollCreated}
      />
    </div>
  );
}
