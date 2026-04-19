import { Role, VerificationStatus, PostCategory, FlagType, ApprovalStatus } from './generated/prisma/client';
import { prisma } from './src/db';

async function main() {
  console.log("Starting DB Seed...");

  // Clear existing data (optional but good for clean slate)
  await prisma.vulnerabilityFlag.deleteMany();
  await prisma.grievancePost.deleteMany();
  await prisma.shiftLog.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platform.deleteMany();

  // Create Platforms
  const platform1 = await prisma.platform.create({ data: { name: 'Uber' } });
  const platform2 = await prisma.platform.create({ data: { name: 'Foodpanda' } });
  const platform3 = await prisma.platform.create({ data: { name: 'Upwork' } });

  // Create Users
  const advocate = await prisma.user.create({
    data: {
      email: 'advocate@fairgig.com',
      passwordHash: 'seeded_hash',
      role: Role.ADVOCATE,
      approvalStatus: ApprovalStatus.APPROVED,
    }
  });

  const verifier1 = await prisma.user.create({
    data: {
      email: 'verifier1@fairgig.com',
      passwordHash: 'seeded_hash',
      role: Role.VERIFIER,
      approvalStatus: ApprovalStatus.APPROVED,
    }
  });

  const worker1 = await prisma.user.create({
    data: {
      email: 'worker1@fairgig.com',
      passwordHash: 'seeded_hash',
      role: Role.WORKER,
      approvalStatus: ApprovalStatus.APPROVED,
      workerProfile: {
        create: {
          category: 'RIDE_HAILING',
          cityZone: 'Lahore_Central',
        }
      }
    }
  });

  // Create Shift Logs
  const log1 = await prisma.shiftLog.create({
    data: {
      workerId: worker1.id,
      platformId: platform1.id,
      date: new Date('2023-11-01'),
      hoursWorked: 8.5,
      grossEarned: 5000,
      platformDeductions: 1250,
      netReceived: 3750,
      currency: 'PKR',
      status: VerificationStatus.VERIFIED,
      verifierId: verifier1.id,
    }
  });

  const log2 = await prisma.shiftLog.create({
    data: {
      workerId: worker1.id,
      platformId: platform2.id,
      date: new Date('2023-11-02'),
      hoursWorked: 6.0,
      grossEarned: 3000,
      platformDeductions: 900,
      netReceived: 2100,
      currency: 'PKR',
      status: VerificationStatus.PENDING,
    }
  });

  // Create Vulnerability Flags
  await prisma.vulnerabilityFlag.create({
    data: {
      workerId: worker1.id,
      type: FlagType.SUDDEN_INCOME_DROP,
      explanation: 'Detected a 45% income drop for worker compared to last month average on Uber.',
      isResolved: false,
    }
  });

  // Create Grievance Posts
  await prisma.grievancePost.create({
    data: {
      workerId: worker1.id,
      platformId: platform1.id,
      category: PostCategory.PLATFORM_COMPLAINT,
      description: 'The app suddenly logged me out during a surge pricing period and I lost my bonus.',
      rateIntel: 15.5,
      tags: ['app-crash', 'surge-pricing'],
    }
  });

  console.log("DB Seed complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
