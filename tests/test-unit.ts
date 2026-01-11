import { OpinionsService } from "../src/lib/OpinionsService";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { assert } from "chai";

// Mock Connection class
class MockConnection {
    accounts = new Map<string, number>();
    transactions = new Map<string, any[]>(); // pollAddress -> [{signature, sender, memo}]
    
    async getBalance(pubkey: PublicKey) {
        return this.accounts.get(pubkey.toBase58()) || 0;
    }

    async getMinimumBalanceForRentExemption() {
        return 890880; // Standard tiny amount
    }

    async getSignaturesForAddress(address: PublicKey) {
        // Return dummy signatures for the transactions we stored
        const txs = this.transactions.get(address.toBase58()) || [];
        return txs.map(t => ({ signature: t.signature, err: null }));
    }

    async getParsedTransaction(signature: string) {
        // In a real mock, we would store the whole tx structure.
        // Here we just cheat and look up which "poll" this signature belongs to
        // and return the sender we stored.
        for (const [pollAddr, txs] of this.transactions.entries()) {
            const found = txs.find(t => t.signature === signature);
            if (found) {
                return {
                    meta: { err: null },
                    transaction: {
                        message: {
                            accountKeys: [{ pubkey: new PublicKey(found.sender) }]
                        }
                    }
                };
            }
        }
        return null;
    }
}

// Subclass Service to inject Mock behavior
class MockOpinionsService extends OpinionsService {
    mockConn: MockConnection;

    constructor() {
        super("http://mock");
        // @ts-ignore
        this.connection = new MockConnection();
        this.mockConn = this.connection as any as MockConnection;
    }

    // Override sendTransaction to update our Mock State
    async sendTransaction(tx: Transaction, signers: Keypair[]) {
        const sender = signers[0].publicKey.toBase58();
        
        // Very basic simulation of instructions
        for (const ix of tx.instructions) {
             // Check if it's a transfer (programId 11111...)
             if (ix.programId.toBase58() === "11111111111111111111111111111111") {
                 // Decode transfer layout manually or just guess from context
                 // For this test, we know exactly what transfers we are making.
                 // We will just "assume" based on what we passed in the test calls.
                 // But wait, the Service creates the instructions.
                 // We can peek at `keys`.
                 // Transfer: [source, dest]
                 if (ix.keys.length >= 2) {
                     const from = ix.keys[0].pubkey.toBase58();
                     const to = ix.keys[1].pubkey.toBase58();
                     // In the vote, we send 0 lamports. 
                     // In create, we send 1 SOL.
                     // In resolve, we send split.
                     
                     // NOTE: We can't easily parse the data buffer for amount without layout.
                     // We will cheat and set balances manually in the test steps,
                     // OR we rely on the specific flow of the test.
                 }
             }
        }
        
        // If we are Voting (sending to a poll address), record it.
        // If we are Creating, we get the destination from the return value in the test, so we track it there.
        
        return "mock_signature_" + Math.random();
    }
    
    // Helper to simulate funding
    setBalance(pubkey: PublicKey, sol: number) {
        this.mockConn.accounts.set(pubkey.toBase58(), sol * LAMPORTS_PER_SOL);
    }
    
    // Mock helper for voting
    mockRecordVote(pollAddr: string, voterAddr: string, signature: string) {
        const list = this.mockConn.transactions.get(pollAddr) || [];
        list.push({ signature, sender: voterAddr });
        this.mockConn.transactions.set(pollAddr, list);
    }
}

async function runUnitTest() {
    console.log("Running Mock Unit Test...");
    const service = new MockOpinionsService();
    
    const creator = Keypair.generate();
    service.setBalance(creator.publicKey, 10);
    
    // 1. Create Poll
    console.log("1. Create Poll");
    const pollCtx = await service.createPoll(creator, "Unit Test Poll?", 1, Date.now() + 1000);
    
    // Manually move funds in mock (since we didn't fully implement instruction parser)
    service.setBalance(creator.publicKey, 9);
    service.setBalance(new PublicKey(pollCtx.address), 1); 
    
    console.log(`Poll created at ${pollCtx.address} with 1 SOL`);
    
    // 2. Vote
    console.log("2. Voting");
    const voter1 = Keypair.generate();
    const voter2 = Keypair.generate();
    
    // Vote 1
    const sig1 = await service.vote(voter1, new PublicKey(pollCtx.address), "Yes");
    service.mockRecordVote(pollCtx.address, voter1.publicKey.toBase58(), sig1);
    
    // Vote 2
    const sig2 = await service.vote(voter2, new PublicKey(pollCtx.address), "No");
    service.mockRecordVote(pollCtx.address, voter2.publicKey.toBase58(), sig2);
    
    // 3. Resolve
    console.log("3. Resolve");
    // We override sendTransaction to catch the payouts
    let payouts = 0;
    const originalSend = service.sendTransaction.bind(service);
    service.sendTransaction = async (tx, signers) => {
        // We expect a transaction with transfer instructions
        payouts = tx.instructions.length; // Should be 2 transfers
        return "payout_sig";
    };
    
    const pollKeypair = Keypair.fromSecretKey(pollCtx.secretKey);
    await service.resolvePoll(pollKeypair);
    
    console.log(`Instructions in resolve tx: ${payouts}`);
    assert.equal(payouts, 2, "Should have 2 payout instructions");
    
    console.log("Unit Test Passed!");
}

runUnitTest().catch(console.error);
