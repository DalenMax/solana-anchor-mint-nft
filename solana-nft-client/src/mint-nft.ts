import { Connection, PublicKey, Keypair, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { IDL } from './idl/nft_program';
import { CONFIG } from './config/config';
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as fs from 'fs';
import BN from 'bn.js';

// Function để tạo ID ngẫu nhiên
function generateRandomId(): BN {
  // Lấy timestamp hiện tại
  const timestamp = Date.now();
  // Tạo số ngẫu nhiên từ 0-999999
  const randomNum = Math.floor(Math.random() * 1000000);
  // Kết hợp timestamp và số ngẫu nhiên
  const combinedNum = BigInt(timestamp) * BigInt(1000000) + BigInt(randomNum);
  // Chuyển thành BN
  return new BN(combinedNum.toString());
}

async function main() {
  try {
    // 1. Setup connection
    const connection = new Connection(CONFIG.RPC_URL, 'confirmed');

    // 2. Setup wallet
    const secretKeyString = fs.readFileSync(CONFIG.WALLET_PATH, 'utf8');
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const keypair = Keypair.fromSecretKey(secretKey);
    const wallet = new Wallet(keypair);

    // 3. Create provider
    const provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    );

    // 4. Create program
    const program = new Program(
      IDL,
      new PublicKey(CONFIG.PROGRAM_ID),
      provider
    );

    // 5. Setup NFT data
    //const id = new BN(465461445165);
    const id = generateRandomId();
    console.log("Generated ID:", id.toString());
    const name = "K3N experiences";
    const symbol = "K3N";
    const uri = "https://raw.githubusercontent.com/Coding-and-Crypto/Solana-NFT-Marketplace/master/assets/example.json";
    const price = 1;
    const cant = new BN(1);

    // 6. Generate mint address
    const [mintAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("mint"), id.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    console.log("Mint Address:", mintAddress.toString());

    // 7. Get metadata accounts
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(CONFIG.TOKEN_METADATA_PROGRAM_ID);

    const [masterEditionAccount] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintAddress.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    console.log("Master Edition:", masterEditionAccount.toString());

    const [nftMetadata] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintAddress.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    console.log("Metadata:", nftMetadata.toString());

    // 8. Get token account
    const tokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      wallet.publicKey
    );
    console.log("Token Account:", tokenAccount.toString());

    // 9. Create NFT
    console.log("Minting NFT...");
    const tx = await program.methods
      .createSingleNft(id, name, symbol, uri, price, cant)
      .accounts({
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        mint: mintAddress,
        tokenAccount: tokenAccount,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        metadataProgram: TOKEN_METADATA_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        masterEditionAccount: masterEditionAccount,
        nftMetadata: nftMetadata,
      })
      .rpc();

    console.log("Success! Transaction signature:", tx);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
