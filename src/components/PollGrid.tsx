import { PollCard } from "./PollCard";
import { PollDetailModal } from "./PollDetailModal";
import { useState } from "react";

export interface PollData {
  id: string; // The Poll Address
  title: string;
  category: string;
  creator: string;
  reward: number;
  responses: number;
  options: { text: string; percentage: number }[];
  endsAt: string;
  aiContext?: string;
}

interface PollGridProps {
  selectedCategory: string;
  searchQuery: string;
  extraPolls?: PollData[];
}

// Mock data for popular polls
const mockPolls: PollData[] = [
  {
    id: "1",
    title: "Do you prefer self checkout or a human cashier for more than 10 items?",
    category: "Finance",
    creator: "Loblaws",
    reward: 5.5,
    responses: 1234,
    options: [
      { text: "Human Cashier", percentage: 62 },
      { text: "Self Checkout", percentage: 38 },
    ],
    endsAt: "2026-12-31",
  },
  {
    id: "2",
    title: "Are physical discs still important to you, or are you 100% digital?",
    category: "Gaming",
    creator: "Playstation",
    reward: 3.2,
    responses: 856,
    options: [
      { text: "Physical", percentage: 10 },
      { text: "Digital", percentage: 68 },
      { text: "Hybrid", percentage: 22 },
    ],
    endsAt: "2026-02-15",
  },
  {
    id: "3",
    title: "Would you pay $8+ for a high quality \"superfood\" latte?",
    category: "Finance",
    creator: "Starbucks",
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
    title: "If you could only keep ONE subscription, which would it be? (Netflix / Disney+ / HBO Max / YouTube Premium)",
    category: "Entertainment",
    creator: "Netflix",
    reward: 4.1,
    responses: 967,
    options: [
      { text: "Netflix", percentage: 38 },
      { text: "Disney+", percentage: 34 },
      { text: "Crave", percentage: 10 },
      { text: "Youtube Premium", percentage: 8 },
      { text: "other", percentage: 4 },
      { text: "I would not keep any", percentage: 3 },
    ],
    endsAt: "2035-01-01",
  },
  {
    id: "5",
    title: "In an office enviorment, what is your ideal schedule?",
    category: "Office",
    creator: "Amazon",
    reward: 2.5,
    responses: 543,
    options: [
      { text: "Full Remote", percentage: 50 },
      { text: "Hybrid", percentage: 40 },
      { text: "Full Office", percentage: 10 },
    ],
    endsAt: "2027-03-01",
  },
  {
    id: "6",
    title: "Would you take a 10% pay cut for a guaranteed 4-day work week?",
    category: "Office",
    creator: "Microsoft",
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
    title: "s it acceptable to have your camera off during every meeting?",
    category: "Office",
    creator: "GamerPro",
    reward: 3.9,
    responses: 1432,
    options: [
      { text: "Yes", percentage: 55 },
      { text: "No", percentage: 45 },
    ],
    endsAt: "2026-12-31",
  },
  {
    id: "8",
    title: "Do you believe AI will make your specific job easier or replace it entirely?",
    category: "Politics",
    creator: "Apple",
    reward: 5.0,
    responses: 1654,
    options: [
      { text: "Yes", percentage: 78 },
      { text: "No", percentage: 12 },
    ],
    endsAt: "2026-12-31",
  },
];

export function PollGrid({
  selectedCategory,
  searchQuery,
  extraPolls = [], // Added default
}: PollGridProps) {
  const [selectedPoll, setSelectedPoll] = useState<
    (typeof mockPolls)[0] | null
  >(null);
  const [isDetailModalOpen, setIsDetailModalOpen] =
    useState(false);

  const allPolls = [...extraPolls, ...mockPolls];

  const filteredPolls = allPolls.filter((poll) => {
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