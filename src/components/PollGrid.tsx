import { PollCard } from "./PollCard";
import { PollDetailModal } from "./PollDetailModal";
import { useState } from "react";

interface PollGridProps {
  selectedCategory: string;
  searchQuery: string;
}

// Mock data for popular polls
const mockPolls = [
  {
    id: "1",
    title: "Will Bitcoin reach $150K by end of 2026?",
    category: "Finance",
    creator: "CryptoWhale",
    reward: 5.5,
    responses: 1234,
    options: [
      { text: "Yes", percentage: 62 },
      { text: "No", percentage: 38 },
    ],
    endsAt: "2026-12-31",
  },
  {
    id: "2",
    title: "Who will win the next Super Bowl?",
    category: "Sports",
    creator: "SportsAnalyst",
    reward: 3.2,
    responses: 856,
    options: [
      { text: "Chiefs", percentage: 35 },
      { text: "Bills", percentage: 28 },
      { text: "Lions", percentage: 22 },
      { text: "Other", percentage: 15 },
    ],
    endsAt: "2026-02-15",
  },
  {
    id: "3",
    title: "Will AI replace 50% of software jobs by 2030?",
    category: "Technology",
    creator: "TechFuturist",
    reward: 7.8,
    responses: 2103,
    options: [
      { text: "Yes", percentage: 45 },
      { text: "No", percentage: 55 },
    ],
    endsAt: "2030-01-01",
  },
  {
    id: "4",
    title: "Will NASA land humans on Mars before 2035?",
    category: "Science",
    creator: "SpaceExplorer",
    reward: 4.1,
    responses: 967,
    options: [
      { text: "Yes", percentage: 58 },
      { text: "No", percentage: 42 },
    ],
    endsAt: "2035-01-01",
  },
  {
    id: "5",
    title: "Next Best Picture Oscar Winner?",
    category: "Entertainment",
    creator: "FilmBuff",
    reward: 2.5,
    responses: 543,
    options: [
      { text: "Oppenheimer 2", percentage: 40 },
      { text: "The Martian Chronicles", percentage: 30 },
      { text: "Unknown", percentage: 30 },
    ],
    endsAt: "2027-03-01",
  },
  {
    id: "6",
    title: "Will Solana flip Ethereum by market cap?",
    category: "Finance",
    creator: "SolanaMaxi",
    reward: 6.3,
    responses: 1876,
    options: [
      { text: "Yes", percentage: 48 },
      { text: "No", percentage: 52 },
    ],
    endsAt: "2028-12-31",
  },
  {
    id: "7",
    title: "Best Game of the Year 2026?",
    category: "Gaming",
    creator: "GamerPro",
    reward: 3.9,
    responses: 1432,
    options: [
      { text: "GTA VI", percentage: 55 },
      { text: "Elder Scrolls VI", percentage: 25 },
      { text: "Other", percentage: 20 },
    ],
    endsAt: "2026-12-31",
  },
  {
    id: "8",
    title: "Will there be a recession in 2026?",
    category: "Politics",
    creator: "EconWatcher",
    reward: 5.0,
    responses: 1654,
    options: [
      { text: "Yes", percentage: 41 },
      { text: "No", percentage: 59 },
    ],
    endsAt: "2026-12-31",
  },
];

export function PollGrid({
  selectedCategory,
  searchQuery,
}: PollGridProps) {
  const [selectedPoll, setSelectedPoll] = useState<
    (typeof mockPolls)[0] | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] =
    useState(false);

  const filteredPolls = mockPolls.filter((poll) => {
    const matchesCategory =
      selectedCategory === "All" ||
      poll.category === selectedCategory;
    const matchesSearch = poll.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePollClick = (poll: (typeof mockPolls)[0]) => {
    setSelectedPoll(poll);
    setIsDetailModalOpen(true);
  };

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
        poll={selectedPoll}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}