import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { XPEngine } from '@/lib/services/XPEngine';
import { QuestService } from '@/lib/services/QuestService';
import { headers } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const whopSdk = getWhopSdk();
    const hdrs = await headers();
    const { userId } = await whopSdk.verifyUserToken(hdrs);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID not configured' }, { status: 500 });
    }

    const { isSuccess = false } = await request.json();

    const xpEngine = new XPEngine(companyId);
    const questService = new QuestService(companyId);

    // Award XP for the message
    const xpResult = await xpEngine.awardXP(userId, 0, isSuccess);
    
    // Update quest progress
    await questService.updateProgress(userId, isSuccess);

    return NextResponse.json({
      success: true,
      xpResult,
      message: isSuccess ? 'Success message simulated' : 'Regular message simulated'
    });
  } catch (error) {
    console.error('Error simulating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
