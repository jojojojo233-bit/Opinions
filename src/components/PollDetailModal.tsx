import { X, Users, Clock, Coins, TrendingUp, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOpinions } from '../hooks/useOpinions';
import { PublicKey } from '@solana/web3.js';

interface Poll {
  id: string;
  title: string;
  category: string;
  creator: string;
  reward: number;
  responses: number;
  options: Array<{ text: string; percentage: number }>;
  endsAt: string;
  context?: string
  // description?: string;
}

interface PollDetailModalProps {
  poll: Poll | null;
  isOpen: boolean;
  onClose: () => void;
  onVote: (pollId: string, optionIndex: number, userAddress?: string) => void;
  onDelete?: (pollId: string) => void;
}

export function PollDetailModal({ poll, isOpen, onClose, onVote, onDelete }: PollDetailModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { publicKey, sendTransaction } = useWallet();
  const opinionsService = useOpinions();

  useEffect(() => {
    if (poll && isOpen && publicKey) {
      const savedVotes = localStorage.getItem('opinions_votes');
      if (savedVotes) {
        try {
          const votes = JSON.parse(savedVotes);
          const myVote = votes.find((v: any) => v.pollId === poll.id && v.userAddress === publicKey.toBase58());
          if (myVote) {
             setHasVoted(true);
             setSelectedOption(myVote.optionIndex);
          } else {
             setHasVoted(false);
             setSelectedOption(null);
          }
        } catch (e) {
          console.error("Error reading votes", e);
        }
      } else {
         setHasVoted(false);
         setSelectedOption(null);
      }
    } else if (!isOpen) {
        // Reset state when closed
        setHasVoted(false);
        setSelectedOption(null);
    }
  }, [poll, isOpen, publicKey]);

  if (!isOpen || !poll) return null;

  const handleVote = async () => {
    if (selectedOption === null || !poll) return;
        
        if (!publicKey) {
            alert("Please connect wallet first");
            return;
        }
    
        try {
            setLoading(true);
            // We need the Poll Address. For mock data, IDs are "1", "2".
            // For real data, IDs are Base58 addresses.
            // We will try to parse ID as Pubkey. 
            // If it fails (mock data), we mock the vote.
            let pollPubkey: PublicKey | null = null;
            try {
                pollPubkey = new PublicKey(poll.id);
            } catch {
                console.log("Mock Poll ID, simulating vote locally only");
            }
    
            if (pollPubkey) {
                    const optionText = poll.options[selectedOption].text;
                    const tx = await opinionsService.buildVoteTransaction(
                        publicKey,
                        pollPubkey,
                        optionText
                    );

                    // --- DIAGNOSTIC START ---
                    tx.feePayer = publicKey;
                    const { blockhash } = await opinionsService.connection.getLatestBlockhash();
                    tx.recentBlockhash = blockhash;
                    
                    const simulation = await opinionsService.connection.simulateTransaction(tx);
                    if (simulation.value.err) {
                        const logs = simulation.value.logs ? simulation.value.logs.join('\n') : "";
                        throw new Error(`Vote Simulation Failed: ${JSON.stringify(simulation.value.err)}\nLogs: ${logs}`);
                    }
                    // --- DIAGNOSTIC END ---
                    
                    const signature = await sendTransaction(tx, opinionsService.connection);
                    console.log("Vote Sent:", signature);
                    await opinionsService.connection.confirmTransaction(signature, 'confirmed');
            } else {
                    await new Promise(r => setTimeout(r, 1000)); // Fake delay
            }
    
            if (poll) {
              onVote(poll.id, selectedOption, publicKey?.toBase58());
            }
            setHasVoted(true);
        } catch (e) {
            console.error("Vote failed", e);
            alert("Vote failed");
        } finally {
            setLoading(false);
        }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRewardPerVote = () => {
    return (poll.reward / (poll.responses+1)).toFixed(4); // +1 to prevent infinity
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4 z-10 flex gap-2">
            {onDelete && (
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to delete this poll?')) {
                            onDelete(poll.id);
                            onClose();
                        }
                    }}
                    className="bg-white rounded-md text-red-400 hover:text-red-500 focus:outline-none"
                    title="Delete Poll (Dev)"
                >
                    <Trash2 className="h-6 w-6" />
                </button>
            )}
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-white px-6 pt-6 pb-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {poll.category}
                </span>
                <span className="text-sm text-gray-500">
                  by {poll.creator.length > 15 ? "Anonymous User" : poll.creator}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {poll.title}
              </h2>
              
              {/* Stats Bar */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <div>
                    <span className="font-semibold text-yellow-600">{poll.reward} SOL</span>
                    <span className="text-gray-500 ml-1">pool</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{poll.responses.toLocaleString()} responses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Ends {formatDate(poll.endsAt)}</span>
                </div>
              </div>

              {/* Context/Description */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Context</h3>
                    <p className="text-sm text-gray-600">
                      {poll.context || 
                        "There is no context."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900">
                  <strong>Reward:</strong> ~{getRewardPerVote()} SOL per vote • Distributed when poll closes
                </p>
              </div>
            </div>

            {/* Voting Options */}
            <div className="space-y-3">
              {poll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !hasVoted && setSelectedOption(index)}
                  disabled={hasVoted}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedOption === index
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                      : hasVoted
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 flex items-center gap-2">
                      {option.text}
                      {hasVoted && selectedOption === index && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          Your Vote
                        </span>
                      )}
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      {option.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    ~{Math.round(poll.responses * (option.percentage / 100)).toLocaleString()} votes
                  </div>
                </button>
              ))}
            </div>

            {/* Vote Button */}
            {!hasVoted && (
              <button
                onClick={handleVote}
                disabled={selectedOption === null || loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mt-4 ${
                  selectedOption !== null && !loading
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Vote & Earn Reward'}
              </button>
            )}

            {hasVoted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mt-4">
                <p className="text-green-800 font-medium">
                  ✓ Vote submitted! You'll receive ~{getRewardPerVote()} SOL when the poll closes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
