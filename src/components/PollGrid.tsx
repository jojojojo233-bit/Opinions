import { PollCard } from "./PollCard";
import { PollDetailModal } from "./PollDetailModal";
import { useState } from "react";

export interface PollData {
  id: string; // The Poll Address
  title: string;
  category: string;
  context: string;
  creator: string;
  reward: number;
  responses: number;
  options: { text: string; percentage: number }[];
  endsAt: string;
}

interface PollGridProps {
  selectedCategory: string;
  searchQuery: string;
  polls: PollData[];
  onVote: (pollId: string, optionIndex: number, userAddress?: string) => void;
  onDelete: (pollId: string) => void;
}


// Mock data removed (moved to ../data/mockPolls.ts)

export function PollGrid({
  selectedCategory,
  searchQuery,
  polls,
  onVote,
  onDelete
}: PollGridProps) {
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] =
    useState(false);

  const filteredPolls = polls.filter((poll) => {
    const matchesCategory =
      selectedCategory === "All" ||
      poll.category === selectedCategory;
    const matchesSearch = poll.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePollClick = (poll: PollData) => {
    setSelectedPollId(poll.id);
    setIsDetailModalOpen(true);
  };

  const activePoll = polls.find((p) => p.id === selectedPollId) || null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Popular Polls
        </h2>
        <p className="text-gray-600 mt-1">
          Answer polls and earn rewards
        </p>
      </div>

      {filteredPolls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No polls found matching your criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onClick={() => handlePollClick(poll)}
            />
          ))}
        </div>
      )}
      <PollDetailModal
        poll={activePoll}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onVote={onVote}
        onDelete={onDelete}
      />
    </div>
  );
}
