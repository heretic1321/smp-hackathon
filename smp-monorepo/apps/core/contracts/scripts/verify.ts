import { run } from "hardhat";

async function main() {
  // Get contract addresses from command line arguments or environment
  const bossLogAddress = process.env.BOSS_LOG_ADDRESS;
  const relic721Address = process.env.RELIC_721_ADDRESS;
  const playerCardSBTAddress = process.env.PLAYER_CARD_SBT_ADDRESS;

  if (!bossLogAddress || !relic721Address || !playerCardSBTAddress) {
    console.error("❌ Contract addresses not found in environment");
    console.log("Please set BOSS_LOG_ADDRESS, RELIC_721_ADDRESS, and PLAYER_CARD_SBT_ADDRESS");
    process.exit(1);
  }

  console.log("🔍 Verifying contracts on BaseScan...\n");

  // Verify BossLog
  console.log("📜 Verifying BossLog...");
  try {
    await run("verify:verify", {
      address: bossLogAddress,
      constructorArguments: [],
    });
    console.log("✅ BossLog verified");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  BossLog already verified");
    } else {
      console.error("❌ Error verifying BossLog:", error.message);
    }
  }

  // Verify Relic721
  console.log("\n📜 Verifying Relic721...");
  try {
    await run("verify:verify", {
      address: relic721Address,
      constructorArguments: ["ipfs://"],
    });
    console.log("✅ Relic721 verified");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  Relic721 already verified");
    } else {
      console.error("❌ Error verifying Relic721:", error.message);
    }
  }

  // Verify PlayerCardSBT
  console.log("\n📜 Verifying PlayerCardSBT...");
  try {
    await run("verify:verify", {
      address: playerCardSBTAddress,
      constructorArguments: [],
    });
    console.log("✅ PlayerCardSBT verified");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  PlayerCardSBT already verified");
    } else {
      console.error("❌ Error verifying PlayerCardSBT:", error.message);
    }
  }

  console.log("\n✅ Verification complete!");
  console.log("🔗 View contracts on BaseScan:");
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


