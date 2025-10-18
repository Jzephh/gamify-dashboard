import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { LevelUpService } from '@/lib/services/LevelUpService';
import { headers } from 'next/headers';

export const runtime = 'nodejs';

export async function GET() {
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

    const levelUpService = new LevelUpService(companyId);
    const notifications = await levelUpService.getUnseenNotifications(userId);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error getting level-up notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
