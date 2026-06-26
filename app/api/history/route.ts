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

    const history = await prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("[HISTORY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
