import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying PlayerCardSBT only...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy PlayerCardSBT
  console.log("📜 Deploying PlayerCardSBT...");
  const PlayerCardSBT = await ethers.getContractFactory("PlayerCardSBT");
  
  const playerCardSBT = await PlayerCardSBT.deploy({
    gasLimit: 3000000,
  });
  
  console.log("⏳ Waiting for deployment transaction to be mined...");
  await playerCardSBT.waitForDeployment();
  
  const playerCardSBTAddress = await playerCardSBT.getAddress();
  console.log("✅ PlayerCardSBT deployed to:", playerCardSBTAddress);

  console.log("\n📝 Add this to your apps/core/.env file:");
  console.log(`PLAYER_CARD_SBT_ADDRESS=${playerCardSBTAddress}`);
  
  console.log("\n📝 Complete contract addresses:");
  console.log("BOSS_LOG_ADDRESS=0x0ff7942fDFF42F6869f8B02C85cD6D156C0C5327");
  console.log("RELIC_721_ADDRESS=0x4267c1dbBb09E9EdDA7400C6283d10771163C940");
  console.log(`PLAYER_CARD_SBT_ADDRESS=${playerCardSBTAddress}`);

  console.log("\n✅ Deployment complete!");
  console.log("🔗 View on BaseScan:");
  console.log(`   https://sepolia.basescan.org/address/${playerCardSBTAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
