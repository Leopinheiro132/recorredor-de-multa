import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    // NUNCA CONFIE NO FRONT END
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stats = await prisma.userStats.findUnique({
      where: { userId }
    });

    if (!stats) {
      return NextResponse.json({
        totalAnalyses: 0,
        avgProbability: 0,
        potentialSavings: 0
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[KPIS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
