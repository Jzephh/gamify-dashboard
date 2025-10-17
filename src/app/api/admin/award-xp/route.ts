import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { UserService } from '@/lib/services/UserService';
import { XPEngine } from '@/lib/services/XPEngine';
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

    const userService = new UserService(companyId);
    const isAdmin = await userService.isAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { targetUserId, xpAmount } = await request.json();

    if (!targetUserId || !xpAmount || xpAmount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const xpEngine = new XPEngine(companyId);
    const result = await xpEngine.awardXP(targetUserId, xpAmount);

    if (!result.success) {
      return NextResponse.json({ error: result.reason || 'Failed to award XP' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error awarding XP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
