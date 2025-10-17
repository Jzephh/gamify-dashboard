import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { UserService } from '@/lib/services/UserService';
import { BadgeService } from '@/lib/services/BadgeService';
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

    const { targetUserId, badgeType, action } = await request.json();

    if (!targetUserId || !badgeType || !action) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const badgeService = new BadgeService(companyId);
    let success = false;

    if (action === 'unlock') {
      success = await badgeService.unlockBadge(targetUserId, badgeType);
    } else if (action === 'lock') {
      success = await badgeService.lockBadge(targetUserId, badgeType);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to update badge' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating badge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
