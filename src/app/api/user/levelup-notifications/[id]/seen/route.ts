import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { LevelUpService } from '@/lib/services/LevelUpService';
import { headers } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    await levelUpService.markAsSeen(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as seen:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
