import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useOpinions } from '../hooks/useOpinions';
import { mockPolls } from '../data/mockPolls';
import { PollData } from './PollGrid';
import { Settings, Check, Loader2, AlertTriangle } from 'lucide-react';

export function DevTools({ onUpdatePolls }: { onUpdatePolls: (polls: PollData[]) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const { publicKey, sendTransaction } = useWallet();
    const opinionsService = useOpinions();

    const handleSeedOnChain = async () => {
        if (!publicKey) {
            alert('Connect wallet to seed polls on devnet');
            return;
        }
        if (!confirm('This will create real on-chain accounts for all mock polls. You will be asked to sign multiple transactions. Continue?')) {
            return;
        }

        setLoading(true);
        setProgress('Starting...');
        
        try {
            const newPolls: PollData[] = [];
            const existingPolls = JSON.parse(localStorage.getItem('opinions_db_polls') || '[]');
            
            // Prefer using existing "mock" data from DB if available, else standard mocks
            // We filter for polls that look like mocks (short IDs)
            let targets = existingPolls.length > 0 ? existingPolls : mockPolls;

            // If existing polls are already on chain (long IDs), we shouldn't re-seed them necessarily, 
            // but the user button says "Make mock poll voting on blockchain".
            // So we target specifically polls with ID "1", "2", etc.
            const mocksToConvert = targets.filter((p: PollData) => p.id.length < 10);

            if (mocksToConvert.length === 0) {
                alert('No mock polls (with short IDs) found to upgrade.');
                setLoading(false);
                return;
            }

            setProgress(`Found ${mocksToConvert.length} mocks to upgrade...`);

            for (const [index, mock] of mocksToConvert.entries()) {
                setProgress(`Deploying poll ${index + 1}/${mocksToConvert.length}: "${mock.title.substring(0, 20)}..."`);
                
                const resolveDate = new Date(mock.endsAt).getTime();
                
                // Build transaction
                const { transaction, pollKeypair } = await opinionsService.buildCreatePollTransaction(
                    publicKey,
                    mock.title,
                    mock.reward || 0.1, // Minimum reward if mock has strange number
                    resolveDate
                );

                transaction.feePayer = publicKey;
                const { blockhash } = await opinionsService.connection.getLatestBlockhash();
                transaction.recentBlockhash = blockhash;

                // Send
                const signature = await sendTransaction(transaction, opinionsService.connection);
                await opinionsService.connection.confirmTransaction(signature, 'confirmed');

                // Create updated poll object
                const upgradedPoll = {
                    ...mock,
                    id: pollKeypair.publicKey.toBase58(), // THE NEW REAL ID
                    // We keep the old mock stats (responses, percentages) visually
                };
                newPolls.push(upgradedPoll);
                
                // Save secret key locally just in case
                const pollSecrets = JSON.parse(localStorage.getItem('opinions_poll_secrets') || '{}');
                pollSecrets[pollKeypair.publicKey.toBase58()] = Array.from(pollKeypair.secretKey);
                localStorage.setItem('opinions_poll_secrets', JSON.stringify(pollSecrets));

                // Wait a bit to prevent rate limiting
                await new Promise(r => setTimeout(r, 1000));
            }

            // Merge: Replace the old mocks with new ones in the main list
            const finalPolls = targets.map((p: PollData) => {
                const upgraded = newPolls.find(np => np.title === p.title); // Match by title roughly
                return upgraded || p;
            });

            onUpdatePolls(finalPolls);
            setProgress('Done!');
            alert('Success! Mock polls are now on-chain.');
            setIsOpen(false);

        } catch (e: any) {
            console.error(e);
            alert(`Error seeding polls: ${e.message}`);
        } finally {
            setLoading(false);
            setProgress('');
        }
    };

    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-full">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-yellow-900">Setup Required</h3>
                        <p className="text-sm text-yellow-700">
                            Mock polls are currently off-chain. Deploy them to Solana to enable real voting.
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {loading ? (
                        <div className="flex items-center gap-2 text-purple-600 font-medium bg-white px-4 py-2 rounded-lg border border-purple-100">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {progress || 'Processing...'}
                        </div>
                    ) : (
                        <button
                            onClick={handleSeedOnChain}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                publicKey 
                                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                            title={!publicKey ? "Connect Wallet First" : ""}
                        >
                            {publicKey ? "Deploy to Devnet" : "Connect Wallet to Deploy"}
                        </button>
                    )}
                    
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="text-gray-400 hover:text-gray-600 p-2"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-yellow-200 flex justify-between items-center bg-yellow-50/50">
                <span className="text-xs text-yellow-700 font-medium">
                   Don't see your code changes? Reset is required.
                </span>
                <button 
                    onClick={() => {
                        // eslint-disable-next-line no-restricted-globals
                        if(confirm('This will delete all saved polls and votes to reload your latest code changes. Continue?')) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded hover:bg-red-200 transition-colors uppercase tracking-wide border border-red-200"
                >
                    Reset & Reload Data
                </button>
            </div>
        </div>
    );
}

// Helper icon
function X(props: any) {
    return (
        <svg 
          {...props}
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
    )
}
