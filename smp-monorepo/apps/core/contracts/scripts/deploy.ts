import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Shadow Monarch's Path contracts to Base Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Deploy BossLog
  console.log("📜 Deploying BossLog...");
  const BossLog = await ethers.getContractFactory("BossLog");
  const bossLog = await BossLog.deploy();
  await bossLog.waitForDeployment();
  const bossLogAddress = await bossLog.getAddress();
  console.log("✅ BossLog deployed to:", bossLogAddress);

  // 2. Deploy Relic721
  console.log("\n📜 Deploying Relic721...");
  const Relic721 = await ethers.getContractFactory("Relic721");
  const relic721 = await Relic721.deploy("ipfs://"); // Base URI for metadata
  await relic721.waitForDeployment();
  const relic721Address = await relic721.getAddress();
  console.log("✅ Relic721 deployed to:", relic721Address);

  // 3. Deploy PlayerCardSBT
  console.log("\n📜 Deploying PlayerCardSBT...");
  const PlayerCardSBT = await ethers.getContractFactory("PlayerCardSBT");
  
  // Add a small delay and wait for nonce
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const playerCardSBT = await PlayerCardSBT.deploy({
    gasLimit: 3000000, // Explicit gas limit
  });
  await playerCardSBT.waitForDeployment();
  const playerCardSBTAddress = await playerCardSBT.getAddress();
  console.log("✅ PlayerCardSBT deployed to:", playerCardSBTAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`BossLog:          ${bossLogAddress}`);
  console.log(`Relic721:         ${relic721Address}`);
  console.log(`PlayerCardSBT:    ${playerCardSBTAddress}`);
  console.log("=".repeat(60));

  console.log("\n📝 Add these to your apps/core/.env file:");
  console.log(`BOSS_LOG_ADDRESS=${bossLogAddress}`);
  console.log(`RELIC_721_ADDRESS=${relic721Address}`);
  console.log(`PLAYER_CARD_SBT_ADDRESS=${playerCardSBTAddress}`);

  console.log("\n✅ Deployment complete!");
  console.log("🔗 View on BaseScan:");
  console.log(`   https://sepolia.basescan.org/address/${bossLogAddress}`);
  console.log(`   https://sepolia.basescan.org/address/${relic721Address}`);
  console.log(`   https://sepolia.basescan.org/address/${playerCardSBTAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
