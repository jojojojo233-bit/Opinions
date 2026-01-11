import { OpinionsService } from "../src/lib/OpinionsService";
import { Keypair, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";
import { assert } from "chai";

// A simple script to test the logic manually (similar to what `anchor test` would do)
async function params() {
    const service = new OpinionsService("http://127.0.0.1:8899");
    
    // We need to fund a creator first.
    // On localnet, we can usually request airdrops.
    const creator = Keypair.generate();
    console.log("Requesting airdrop for creator...", creator.publicKey.toBase58());
    
    const sig = await service.connection.requestAirdrop(creator.publicKey, 2 * LAMPORTS_PER_SOL);
    
    // Wait for confirmation
    const latestBlockHash = await service.connection.getLatestBlockhash();
    await service.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: sig,
    });
    console.log("Airdrop confirmed.");

    // --- 1. Create Poll ---
    console.log("Creating Poll...");
    const pollAmount = 1; // 1 SOL
    const pollCtx = await service.createPoll(
        creator, 
        "Is TypeScript better than Rust?", 
        pollAmount, 
        Date.now() + 10000
    );
    console.log(`Poll Created at ${pollCtx.address} with ${pollCtx.totalPrizePool} SOL`);
    
    // --- 2. Vote ---
    console.log("Voting...");
    const voter1 = Keypair.generate();
    const voter2 = Keypair.generate();

    // Fund voters for gas
    await service.connection.requestAirdrop(voter1.publicKey, 0.1 * LAMPORTS_PER_SOL);
    await service.connection.requestAirdrop(voter2.publicKey, 0.1 * LAMPORTS_PER_SOL);
    // wait for airdrops... (simple wait)
    await new Promise(r => setTimeout(r, 2000));

    await service.vote(voter1, new Keypair({ publicKey: Buffer.from(base58ToBuffer(pollCtx.address)), secretKey: new Uint8Array() }).publicKey, "Yes");
    await service.vote(voter2, new Keypair({ publicKey: Buffer.from(base58ToBuffer(pollCtx.address)), secretKey: new Uint8Array() }).publicKey, "No");
    console.log("Votes cast.");

    // Helper for keypair reconstruction from data
    function base58ToBuffer(b58: string) {
       // Only for the test logic usage
       return require("bs58").decode(b58); 
    }
    
    // Reconstruct the poll keypair from the secret we got back (simulation of server holding keys)
    const pollKeypair = Keypair.fromSecretKey(pollCtx.secretKey);

    // --- 3. Resolve ---
    console.log("Resolving Poll...");
    
    // Check initial balance of voter 1
    const v1BalanceBefore = await service.connection.getBalance(voter1.publicKey);

    await service.resolvePoll(pollKeypair);

    const v1BalanceAfter = await service.connection.getBalance(voter1.publicKey);
    console.log(`Voter 1 Balance Change: ${(v1BalanceAfter - v1BalanceBefore) / LAMPORTS_PER_SOL} SOL`);
    
    // Expected: (1 SOL - fees) / 2 voters ~= 0.49 SOL
    assert.isTrue((v1BalanceAfter - v1BalanceBefore) > 0.4 * LAMPORTS_PER_SOL, "Voter received share");
    console.log("Test Passed!");
}

params().catch(console.error);
