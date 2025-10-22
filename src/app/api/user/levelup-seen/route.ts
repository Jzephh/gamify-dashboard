import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { UserService } from '@/lib/services/UserService';
import { headers } from 'next/headers';

export const runtime = 'nodejs';

export async function POST() {
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

    // Check if user has "Level Member" role
    const userService = new UserService(companyId);
    const profile = await userService.getUserProfile(userId);
    
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasLevelMemberRole = profile.user.roles.some(role => 
      role.toLowerCase() === 'level member' || role.toLowerCase() === 'levelmember'
    );

    if (!hasLevelMemberRole) {
      return NextResponse.json({ error: 'Access denied: Level Member role required' }, { status: 403 });
    }

    const success = await userService.markLevelUpSeen(userId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to mark level up as seen' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking level up as seen:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
