import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
// Client
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { NftProgram } from "../target/types/nft_program";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.NftProgram as anchor.Program<NftProgram>;


//https://raw.githubusercontent.com/687c/solana-nft-native-client/main/metadata.json
console.log("My address:", program.provider.publicKey.toString());
const balance = await program.provider.connection.getBalance(program.provider.publicKey);
console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

//------ region mint nft --------//
const id = new BN(4655954);

// service id
//let serviceId: string = "12345676";

let name: string = "K3N experiences";
let symbol: string = "K3N";
let uri: string =
  "https://raw.githubusercontent.com/Coding-and-Crypto/Solana-NFT-Marketplace/master/assets/example.json";

const price = new BN(1).toNumber();
const cant = new BN(1);

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

let [mintAddress, bump] = await web3.PublicKey.findProgramAddress(
  [Buffer.from("mint"), id.toArrayLike(Buffer, "le", 8)],
  program.programId
);

console.log("mintAddress:", mintAddress.toBase58());

let [masterEditionAccount, bump2] = await web3.PublicKey.findProgramAddress(
  [
    Buffer.from("metadata"),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    mintAddress.toBuffer(),
    Buffer.from("edition"),
  ],
  TOKEN_METADATA_PROGRAM_ID
);

console.log("masterEditionAcount: ", masterEditionAccount.toBase58());

let [nftMetadata, bump3] = await web3.PublicKey.findProgramAddress(
  [
    Buffer.from("metadata"),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    mintAddress.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID
);
console.log("nftMetadata: ", nftMetadata.toBase58());

const tokenAccount = await getAssociatedTokenAddress(
  mintAddress,
  program.provider.publicKey
);

console.log("tokenAccount", tokenAccount.toBase58());

// gen address KOL, test only
const newKol = new web3.Keypair();
console.log('kol address: ',newKol.publicKey.toBase58());
const balance_of_kol = await program.provider.connection.getBalance(newKol.publicKey);
console.log(
  `KOL balance before finish service: ${
    balance_of_kol / web3.LAMPORTS_PER_SOL
  } SOL`
);

const txCreateServiceHash = await program.methods
  .createSingleNft(id, name, symbol, uri, price, cant)
  .accounts({
    authority: program.provider.publicKey,
    //authority: newKol.publicKey,
    payer: program.provider.publicKey,
    mint: mintAddress,
    tokenAccount: tokenAccount,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    metadataProgram: TOKEN_METADATA_PROGRAM_ID,
    systemProgram: web3.SystemProgram.programId,
    masterEditionAccount: masterEditionAccount,
    nftMetadata: nftMetadata,
  })
  .signers([program.provider.wallet.payer])
  .rpc();

//------ end region create service --------//
