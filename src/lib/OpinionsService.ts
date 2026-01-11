import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  ParsedTransactionWithMeta
} from "@solana/web3.js";
import { Buffer } from 'buffer';

// Since we cannot use a Rust smart contract, we will simulate the "Program" behavior
// using a TypeScript class that manages Polls as Keypairs.
// This is a "Client-Side" or "Server-Side" logic replacement.

export interface PollData {
  address: string;
  question: string;
  creator: string;
  resolveDate: number;
  totalPrizePool: number;
  isResolved: boolean;
}

export class OpinionsService {
  connection: Connection;

  constructor(endpoint: string = "http://127.0.0.1:8899") {
    this.connection = new Connection(endpoint, "confirmed");
  }

  async sendTransaction(tx: Transaction, signers: Keypair[]) {
    return await sendAndConfirmTransaction(this.connection, tx, signers);
  }

  // 1. Create Poll: Generates a new Keypair to act as the "Pot".
  // The creator sends funds to this address.
  async createPoll(
    creator: Keypair, // Kept for backward compatibility with tests
    question: string,
    amountSol: number,
    resolveDate: number
  ): Promise<PollData & { secretKey: Uint8Array }> {
    const pollKeypair = Keypair.generate();
    
    // Transfer funds to the Poll "Pot"
    const transferIx = SystemProgram.transfer({
      fromPubkey: creator.publicKey,
      toPubkey: pollKeypair.publicKey,
      lamports: amountSol * LAMPORTS_PER_SOL,
    });

    // Add a memo to store metadata on-chain about this poll
    // Memo format: "OPINIONS:CREATE:<RESOLVE_DATE>:<QUESTION>"
    const memoContent = `OPINIONS:CREATE:${resolveDate}:${question}`;
      const memoIx = new TransactionInstruction({
      keys: [{ pubkey: creator.publicKey, isSigner: true, isWritable: true }],
      programId: new PublicKey("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo"),
      data: Buffer.from(memoContent, "utf-8"),
    });

    const tx = new Transaction().add(transferIx).add(memoIx);
    
    await this.sendTransaction(tx, [creator]);

    return {
      address: pollKeypair.publicKey.toBase58(),
      question,
      creator: creator.publicKey.toBase58(),
      resolveDate,
      totalPrizePool: amountSol,
      isResolved: false,
      secretKey: pollKeypair.secretKey, 
    };
  }

  // Frontend Helper: Build transaction for Wallet Adapter
  async buildCreatePollTransaction(
      creatorPubkey: PublicKey,
      question: string,
      amountSol: number,
      resolveDate: number
  ): Promise<{ transaction: Transaction, pollKeypair: Keypair }> {
      const pollKeypair = Keypair.generate();
      
      const transferIx = SystemProgram.transfer({
        fromPubkey: creatorPubkey,
        toPubkey: pollKeypair.publicKey,
        lamports: amountSol * LAMPORTS_PER_SOL,
      });
  
      const memoContent = `OPINIONS:CREATE:${resolveDate}:${question}`;
      const memoIx = new TransactionInstruction({
        keys: [{ pubkey: creatorPubkey, isSigner: true, isWritable: true }],
        programId: new PublicKey("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo"),
        data: Buffer.from(memoContent, "utf-8"),
      });
  
      const tx = new Transaction().add(transferIx).add(memoIx);
      return { transaction: tx, pollKeypair };
  }

  // 2. Vote: User sends 0 SOL to the Poll address with a Memo.
  // The Memo acts as the "Vote".
  async vote(
    voter: Keypair,
    pollAddress: PublicKey,
    response: string
  ): Promise<string> {
    const memoContent = `OPINIONS:VOTE:${response}`;
    
    // Create a transaction with a Memo
    const memoIx = new TransactionInstruction({
      keys: [{ pubkey: voter.publicKey, isSigner: true, isWritable: true }],
      programId: new PublicKey("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo"),
      data: Buffer.from(memoContent, "utf-8"),
    });

    // We also send a tiny amount (dust) to the poll just to link the accounts in block explorers cleanly,
    // though the Memo is technically enough. Let's just do a 0-value transfer to target the poll.
    const transferIx = SystemProgram.transfer({
        fromPubkey: voter.publicKey,
        toPubkey: pollAddress,
        lamports: 0, // 0 SOL transfer
    });

    const tx = new Transaction().add(transferIx).add(memoIx);
    
    return await this.sendTransaction(tx, [voter]);
  }

  // Frontend Helper: Build Vote Transaction
  async buildVoteTransaction(
      voterPubkey: PublicKey,
      pollAddress: PublicKey,
      response: string
  ): Promise<Transaction> {
      const memoContent = `OPINIONS:VOTE:${response}`;
      
      const memoIx = new TransactionInstruction({
        keys: [{ pubkey: voterPubkey, isSigner: true, isWritable: true }],
        programId: new PublicKey("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo"),
        data: Buffer.from(memoContent, "utf-8"),
      });
  
      const transferIx = SystemProgram.transfer({
          fromPubkey: voterPubkey,
          toPubkey: pollAddress,
          lamports: 0.1 * LAMPORTS_PER_SOL, // Vote Entry Fee: 0.1 SOL
      });
  
      return new Transaction().add(transferIx).add(memoIx);
  }

  // 3. Resolve: Distribution Logic.
  // This function would be run by the "maintainer" or "server" holding the Poll Private Key.
  // It finds all voters and splits the Pot equally.
  async resolvePoll(
    pollKeypair: Keypair 
  ): Promise<string[]> {
    const balance = await this.connection.getBalance(pollKeypair.publicKey);
    if (balance === 0) throw new Error("Poll/Pot is empty");

    // Fetch all transactions to the poll address to find voters
    // Limit to 1000 for this demo.
    const signatures = await this.connection.getSignaturesForAddress(pollKeypair.publicKey);
    
    const voters = new Set<string>();

    for (const sigInfo of signatures) {
        // In a real indexer, we would parse the tx to verify it has the correct Memo format.
        // For simplicity, we assume any sender to this address (excluding the creator's initial funding) is a voter.
        // We need to fetch the detailed tx to see the sender.
        const tx = await this.connection.getParsedTransaction(sigInfo.signature);
        
        if (!tx || !tx.meta || tx.meta.err) continue;

        // Extract sender. usually the first account key is the fee payer/sender in simple app txs.
        const sender = tx.transaction.message.accountKeys[0].pubkey.toBase58();
        
        // Exclude the poll itself (if it did anything) and maybe check memo
        if (sender !== pollKeypair.publicKey.toBase58()) {
             voters.add(sender);
        }
    }

    // Exclude the creator funding tx? Ideally yes.
    // We can assume the "oldest" tx is the funding one.
    // If voters set is empty, nothing to do.
    if (voters.size === 0) return [];

    // Calculate split
    // Reserve specific amount for fees? For now, we just split available balance.
    // We need to leave a tiny bit for rent or fees of the distribution implementation.
    const rentExemption = await this.connection.getMinimumBalanceForRentExemption(0);
    const distributable = balance - (5000 * voters.size) - rentExemption; // Minus estimated fees
    
    if (distributable <= 0) throw new Error("Not enough funds to cover fees");

    const amountPerVoter = Math.floor(distributable / voters.size);

    const tx = new Transaction();
    
    // We can batch ~20 transfers per transaction due to size limits. 
    // For this demo, we assume < 20 voters.
    for (const voter of voters) {
        tx.add(
            SystemProgram.transfer({
                fromPubkey: pollKeypair.publicKey,
                toPubkey: new PublicKey(voter),
                lamports: amountPerVoter
            })
        );
    }

    const signature = await this.sendTransaction(tx, [pollKeypair]);
    return [signature];
  }
}
