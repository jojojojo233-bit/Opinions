import { Plus } from 'lucide-react';

interface AddPollButtonProps {
  onClick: () => void;
}

export function AddPollButton({ onClick }: AddPollButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all hover:scale-105"
      aria-label="Add new poll"
    >
      <Plus className="h-5 w-5 mr-2" />
      Add Poll
    </button>
  );
}
