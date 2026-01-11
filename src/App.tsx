import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Categories } from './components/Categories';
import { PollGrid, PollData } from './components/PollGrid';
import { AddPollButton } from './components/AddPollButton';
import { CreatePollModal } from './components/CreatePollModal';
import { mockPolls } from './data/mockPolls';

export default function App() {
  const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [polls, setPolls] = useState<PollData[]>([]);

  useEffect(() => {
    // Load polls from storage on mount
    const saved = localStorage.getItem('opinions_db_polls');
    if (saved) {
        try {
            setPolls(JSON.parse(saved));
        } catch(e) { console.error("Failed to load local polls"); }
    } else {
        // Initialize with mocks + any legacy created polls
        const legacy = localStorage.getItem('opinions_polls');
        const legacyPolls = legacy ? JSON.parse(legacy) : [];
        const initial = [...legacyPolls, ...mockPolls];
        // Deduplicate by ID just in case
        const unique = Array.from(new Map(initial.map(p => [p.id, p])).values());
        setPolls(unique);
        localStorage.setItem('opinions_db_polls', JSON.stringify(unique));
    }
  }, []);

  const handlePollCreated = (newPoll: PollData) => {
      const updated = [newPoll, ...polls];
      setPolls(updated);
      localStorage.setItem('opinions_db_polls', JSON.stringify(updated));
  };

  const handleVote = (pollId: string, optionIndex: number, userAddress?: string) => {
    // Update the poll stats in the "database"
    const updatedPolls = polls.map(p => {
        if (p.id === pollId) {
            const newResponses = p.responses + 1;
            // Recalculate percentages
            const newOptions = p.options.map((opt, idx) => {
                // Approximate current vote count
                const oldVotes = Math.round(p.responses * (opt.percentage / 100));
                const newVotes = idx === optionIndex ? oldVotes + 1 : oldVotes;
                // Calculate new percentage
                return { ...opt, percentage: Math.round((newVotes / newResponses) * 100) };
            });
            // Normalize percentages to 100% (optional, but good for UI)
            // For now, simple update is enough.
            return { ...p, responses: newResponses, options: newOptions };
        }
        return p;
    });
    setPolls(updatedPolls);
    localStorage.setItem('opinions_db_polls', JSON.stringify(updatedPolls));

    // Record the specific vote
    if (userAddress) {
        const savedVotes = localStorage.getItem('opinions_votes');
        const votes = savedVotes ? JSON.parse(savedVotes) : [];
        
        // Prevent storing duplicates if somehow the UI check was bypassed
        const existingVote = votes.find((v: any) => v.pollId === pollId && v.userAddress === userAddress);
        if (!existingVote) {
             const voteRecord = { pollId, userAddress, optionIndex, timestamp: Date.now() };
             votes.push(voteRecord);
             localStorage.setItem('opinions_votes', JSON.stringify(votes));
             console.log("Vote recorded in database:", voteRecord);
        }
    }
  };

  const handleDeletePoll = (pollId: string) => {
      const updatedPolls = polls.filter(p => p.id !== pollId);
      setPolls(updatedPolls);
      localStorage.setItem('opinions_db_polls', JSON.stringify(updatedPolls));
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
          polls={polls}
          onVote={handleVote}
          onDelete={handleDeletePoll}
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
