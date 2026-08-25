import "dotenv/config";

import { db } from "../src/config/db";

const ALL_PERMISSIONS = [
  "CAN_REVIEW_VERIFICATION",
  "CAN_REVIEW_REPORTS",
  "CAN_MANAGE_USERS",
  "CAN_IMPERSONATE",
  "CAN_VIEW_ANALYTICS",
] as const;

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: pnpm admin:grant <email>");
    process.exitCode = 1;
    return;
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exitCode = 1;
    return;
  }

  for (const permission of ALL_PERMISSIONS) {
    await db.adminPermission.upsert({
      where: { userId_permission: { userId: user.id, permission } },
      create: { userId: user.id, permission },
      update: {},
    });
  }

  console.log(`Granted all admin permissions to ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
