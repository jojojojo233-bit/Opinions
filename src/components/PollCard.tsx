import { Users, Clock, Coins } from 'lucide-react';

interface Poll {
  id: string;
  title: string;
  category: string;
  creator: string;
  reward: number;
  responses: number;
  options: Array<{ text: string; percentage: number }>;
  endsAt: string;
}

interface PollCardProps {
  poll: Poll;
  onClick: () => void;
}

export function PollCard({ poll, onClick }: PollCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return 'Ends tomorrow';
    if (diffDays < 30) return `${diffDays} days left`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all p-6 cursor-pointer hover:border-purple-300"
    >
      {/* Category Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {poll.category}
        </span>
        <span className="text-xs text-gray-500">by {poll.creator}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2">
        {poll.title}
      </h3>

      {/* Options Preview */}
      <div className="space-y-2 mb-4">
        {poll.options.slice(0, 2).map((option, index) => (
          <div
            key={index}
            className="w-full text-left p-3 rounded-lg border border-gray-200 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900">{option.text}</span>
              <span className="text-sm font-semibold text-purple-600">
                {option.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${option.percentage}%` }}
              />
            </div>
          </div>
        ))}
        {poll.options.length > 2 && (
          <p className="text-sm text-gray-500 text-center">
            +{poll.options.length - 2} more option{poll.options.length - 2 !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold text-yellow-600">{poll.reward} SOL</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{poll.responses.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{formatDate(poll.endsAt)}</span>
        </div>
      </div>
    </div>
  );
}