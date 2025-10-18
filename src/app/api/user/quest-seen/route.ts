import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
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

    const { questType } = await request.json();
    
    if (!questType || !['daily', 'weekly'].includes(questType)) {
      return NextResponse.json({ error: 'Valid quest type (daily/weekly) is required' }, { status: 400 });
    }

    const questService = new QuestService(companyId);
    const success = await questService.markQuestSeen(userId, questType);

    if (!success) {
      return NextResponse.json({ error: 'Failed to mark quest as seen' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking quest as seen:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
