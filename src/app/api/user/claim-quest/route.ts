import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { QuestService } from '@/lib/services/QuestService';
import { XPEngine } from '@/lib/services/XPEngine';
import { UserService } from '@/lib/services/UserService';

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

    const { objectiveId } = await request.json();
    
    if (!objectiveId) {
      return NextResponse.json({ error: 'Objective ID is required' }, { status: 400 });
    }

    const questService = new QuestService(companyId);
    const xpEngine = new XPEngine(companyId);

    // Claim the objective
    const claimResult = await questService.claimObjective(userId, objectiveId);
    
    console.log('Claim result:', claimResult);
    
    if (!claimResult.success) {
      console.log('Claim failed:', claimResult.error);
      return NextResponse.json({ error: claimResult.error }, { status: 400 });
    }

    // Award XP for the objective
    if (claimResult.xp > 0) {
      await xpEngine.awardQuestXP(userId, claimResult.xp);
    }

    return NextResponse.json({
      success: true,
      xpAwarded: claimResult.xp,
      objectiveId: objectiveId
    });
  } catch (error) {
    console.error('Error claiming quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
