/**
 * Sovereign Swarm — Filecoin Audit Uploader
 * Uploads mission_bundle.json to Filecoin via Synapse SDK.
 * Prints ONLY the PieceCID to stdout (captured by Python).
 * All other output goes to stderr.
 */

import { Synapse } from "@filoz/synapse-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from project root (one level up from audit/)
dotenv.config({ path: resolve(__dirname, "../.env") });

const bundlePath = process.argv[2];
if (!bundlePath) {
  process.stderr.write("Usage: node uploader.js <bundle_file>\n");
  process.exit(1);
}

const rawKey = process.env.FILECOIN_PRIVATE_KEY;
if (!rawKey) {
  process.stderr.write("FILECOIN_PRIVATE_KEY not set in .env\n");
  process.exit(1);
}

// viem requires 0x prefix
const privateKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

async function main() {
  const bundleData = readFileSync(bundlePath, "utf-8");
  const MIN_BYTES = 127;
  const padded = bundleData.length < MIN_BYTES
    ? bundleData + " ".repeat(MIN_BYTES - bundleData.length)
    : bundleData;
  const file = new TextEncoder().encode(padded);

  process.stderr.write(`[Filecoin] Initializing Synapse SDK (calibration testnet)...\n`);

  const synapse = Synapse.create({
    account: privateKeyToAccount(privateKey),
    source: "sovereign-swarm",
  });

  process.stderr.write(`[Filecoin] Preparing storage payment for ${file.byteLength} bytes...\n`);

  const prep = await synapse.storage.prepare({
    dataSize: BigInt(file.byteLength),
  });

  if (prep.transaction) {
    process.stderr.write(`[Filecoin] Executing deposit/approval transaction...\n`);
    const { hash } = await prep.transaction.execute();
    process.stderr.write(`[Filecoin] Payment tx: ${hash}\n`);
  } else {
    process.stderr.write(`[Filecoin] Account already funded, skipping deposit.\n`);
  }

  process.stderr.write(`[Filecoin] Uploading bundle to Filecoin...\n`);

  const { pieceCid, copies, complete, failedAttempts } = await synapse.storage.upload(file);

  process.stderr.write(`[Filecoin] Upload complete — stored on ${copies.length} provider(s)\n`);
  if (!complete) {
    process.stderr.write(`[Filecoin] Warning: ${failedAttempts.length} copy attempt(s) failed\n`);
  }

  // Print ONLY the PieceCID to stdout — Python reads this
  process.stdout.write(pieceCid + "\n");
}

main().catch((err) => {
  process.stderr.write(`[Filecoin] Error: ${err.message}\n`);
  if (err.cause) process.stderr.write(`[Filecoin] Cause: ${err.cause}\n`);
  process.exit(1);
});
