import { Idl } from '@coral-xyz/anchor';

export const IDL: Idl = {
  "version": "0.1.0",
  "name": "nft_program",
  "instructions": [
    {
      "name": "createSingleNft",
      "accounts": [
        {"name": "authority","isMut": true,"isSigner": true},
        {"name": "payer","isMut": true,"isSigner": true},
        {"name": "mint","isMut": true,"isSigner": false},
        {"name": "tokenAccount","isMut": true,"isSigner": false},
        {"name": "associatedTokenProgram","isMut": false,"isSigner": false},
        {"name": "rent","isMut": false,"isSigner": false},
        {"name": "systemProgram","isMut": false,"isSigner": false},
        {"name": "tokenProgram","isMut": false,"isSigner": false},
        {"name": "metadataProgram","isMut": false,"isSigner": false},
        {"name": "masterEditionAccount","isMut": true,"isSigner": false},
        {"name": "nftMetadata","isMut": true,"isSigner": false}
      ],
      "args": [
        {"name": "id","type": "u64"},
        {"name": "name","type": "string"},
        {"name": "symbol","type": "string"},
        {"name": "uri","type": "string"},
        {"name": "price","type": "f32"},
        {"name": "cant","type": "u64"}
      ]
    }
  ],
  "metadata": {
    "address": "DCXNZd4ng8USA69Fzjcmm21qtFX4XywMaF3mn3p9E7Ao"
  }
};
