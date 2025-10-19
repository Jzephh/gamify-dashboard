import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { QuestConfigService } from '@/lib/services/QuestConfigService';
import { QuestService } from '@/lib/services/QuestService';
import { UserService } from '@/lib/services/UserService';

import { headers } from 'next/headers';

export const runtime = 'nodejs';

// GET - Get all quests
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

    // Check if user is admin
    const userService = new UserService(companyId);
    const isAdmin = await userService.isAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const questConfigService = new QuestConfigService(companyId);
    
    // Initialize default quests if they don't exist
    await questConfigService.initializeDefaultQuests();
    
    const quests = await questConfigService.getAllQuests();
    return NextResponse.json(quests);
  } catch (error) {
    console.error('Error getting quests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update quest
export async function PUT(request: Request) {
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

    // Check if user is admin
    const userService = new UserService(companyId);
    const isAdmin = await userService.isAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { questId, updates } = await request.json();
    
    if (!questId) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 });
    }

    const questConfigService = new QuestConfigService(companyId);
    const success = await questConfigService.updateQuest(questId, updates);

    if (!success) {
      return NextResponse.json({ error: 'Failed to update quest' }, { status: 500 });
    }

    // Trigger migration to sync quest progress with updated configurations
    const questService = new QuestService(companyId);
    await questService.migrateQuestProgress();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
