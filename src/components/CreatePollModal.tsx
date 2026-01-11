import { X, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOpinions } from '../hooks/useOpinions';
import { PollData } from './PollGrid';
import { generateContext } from '../lib/generateContext';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPollCreated?: (poll: PollData) => void;
}

export function CreatePollModal({ isOpen, onClose, onPollCreated }: CreatePollModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Politics');
  const [options, setOptions] = useState(['', '']);
  const [reward, setReward] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const { publicKey, sendTransaction } = useWallet();
  const opinionsService = useOpinions();

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
        alert("Please connect your wallet first");
        return;
    }

    try {
        setLoading(true);
        const amount = parseFloat(reward);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid reward amount");
            setLoading(false);
            return;
        }

        // --- NEW: Check Balance ---
        const balance = await opinionsService.connection.getBalance(publicKey);
        const requiredLamports = (amount * 1_000_000_000) + 10_000_000; // Reward + ~0.01 SOL fees
        if (balance < requiredLamports) {
            alert(`Insufficient SOL. You have ${balance / 1e9} SOL, but need ${requiredLamports / 1e9} SOL. Please get Devnet SOL.`);
            setLoading(false);
            return;
        }

        const resolveDate = new Date(endDate).getTime();
        
        // Build transaction
        const { transaction, pollKeypair } = await opinionsService.buildCreatePollTransaction(
            publicKey,
            title,
            amount,
            resolveDate
        );

        // --- DIAGNOSTIC CODE: CAPTURE BUG ---
        // 1. Explicitly set Fee Payer & Blockhash to ensure simulation is accurate
        transaction.feePayer = publicKey;
        const { blockhash, lastValidBlockHeight } = await opinionsService.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        // 2. Simulate Manually to catch the Logs
        console.log("Simulating transaction...");
        const simulation = await opinionsService.connection.simulateTransaction(transaction);
        
        if (simulation.value.err) {
            console.error("Simulation Error Logs:", simulation.value.logs);
            const logStr = simulation.value.logs ? simulation.value.logs.join('\n') : "No logs";
            throw new Error(`Simulation Failed via Diagnostic:\n${JSON.stringify(simulation.value.err)}\nLogs:\n${logStr}`);
        }
        console.log("Simulation Successful!", simulation.value.logs);

        // 3. Send (Wallet Adapter might re-sign/re-fetch blockhash, but that's fine)
        const signature = await sendTransaction(transaction, opinionsService.connection);
        console.log("Transaction sent:", signature);
        
        await opinionsService.connection.confirmTransaction(signature, 'confirmed');

        // Create Poll Object for UI
        const newPoll: PollData = {
            id: pollKeypair.publicKey.toBase58(),
            title,
            category,
            creator: publicKey.toBase58(),
            reward: amount,
            responses: 0,
            options: options.map(text => ({ text, percentage: 0 })),
            endsAt: endDate
        };

        // Save Private Key locally for demo "Resolution" capability later
        // In a real app, this would be a PDA (Program Derived Address) validation, 
        // but here we just stash the key so we can recover funds/resolve.
        try {
            const pollSecrets = JSON.parse(localStorage.getItem('opinions_poll_secrets') || '{}');
            pollSecrets[pollKeypair.publicKey.toBase58()] = Array.from(pollKeypair.secretKey);
            localStorage.setItem('opinions_poll_secrets', JSON.stringify(pollSecrets));
        } catch (e) {
            console.error("Failed to save poll secret", e);
        }

    // Try to generate a short AI-written context for this poll (server-side key required)
    try {
      const context = await generateContext({
        question: title,
        category,
        options: options.filter(o => o.trim() !== ''),
      });
      // attach to the poll shown in UI
      // @ts-ignore - extended property
      newPoll.aiContext = context;
    } catch (e) {
      console.warn('AI context generation failed', e);
    }

    if (onPollCreated) onPollCreated(newPoll);
    onClose();
        
        // Reset form
        setTitle('');
        setReward('');
        setCategory('');
        setOptions(['', '']);
    } catch (err: any) {
        console.error("Create Poll Failed:", err);
        const msg = err.message || JSON.stringify(err);
        alert(`Failed to create poll. Error: ${msg}`);
    } finally {
        setLoading(false);
    }
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="mt-3 sm:mt-0">
              <h3 className="text-2xl font-bold leading-6 text-gray-900 mb-6">
                Create New Poll
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Poll Question
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Will Bitcoin reach $150K by end of 2026?"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option>Politics</option>
                    <option>Sports</option>
                    <option>Technology</option>
                    <option>Entertainment</option>
                    <option>Finance</option>
                    <option>Science</option>
                    <option>Gaming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer Options
                  </label>
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {options.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="mt-2 inline-flex items-center text-sm text-purple-600 hover:text-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add option
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reward" className="block text-sm font-medium text-gray-700">
                      Reward Pool (SOL)
                    </label>
                    <input
                      type="number"
                      id="reward"
                      value={reward}
                      onChange={(e) => setReward(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="5.0"
                      step="0.1"
                      min="0.1"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This will be distributed among respondents
                    </p>
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-900">
                    <strong>How it works:</strong> You'll deposit {reward || '0'} SOL that will be held in escrow. 
                    When the poll ends, the reward will be distributed proportionally among all respondents.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create & Deposit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
