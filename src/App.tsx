import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Categories } from './components/Categories';
import { PollGrid, PollData } from './components/PollGrid';
import { AddPollButton } from './components/AddPollButton';
import { CreatePollModal } from './components/CreatePollModal';
import { DevTools } from './components/DevTools';
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
    console.log(`Processing vote for poll ${pollId}, option ${optionIndex}`);
    
    // Update the poll stats in the "database"
    const updatedPolls = polls.map(p => {
        if (p.id === pollId) {
            const newResponses = p.responses + 1;
            
            // 1. Calculate raw votes based on current percentages
            let currentVotes = p.options.map(opt => Math.round(p.responses * (opt.percentage / 100)));
            
            // 2. Adjust for rounding errors (ensure sum equals total responses)
            const sumVotes = currentVotes.reduce((a, b) => a + b, 0);
            if (sumVotes !== p.responses) {
                 // Distribute difference to the largest option to minimize visual jump
                 const diff = p.responses - sumVotes;
                 const maxIndex = currentVotes.indexOf(Math.max(...currentVotes));
                 currentVotes[maxIndex] += diff;
            }

            // 3. Add the new vote
            currentVotes[optionIndex] += 1;

            // 4. Calculate new percentages
            const newOptions = p.options.map((opt, idx) => {
                const votes = currentVotes[idx];
                const percentage = newResponses > 0 ? Math.round((votes / newResponses) * 100) : 0;
                return { ...opt, percentage };
            });

            console.log(`Updated poll stats: ${newResponses} responses`, newOptions);
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
        <DevTools onUpdatePolls={(updatedPolls) => {
            setPolls(updatedPolls);
            localStorage.setItem('opinions_db_polls', JSON.stringify(updatedPolls));
        }} />

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
