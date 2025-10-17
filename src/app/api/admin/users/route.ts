import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { UserService } from '@/lib/services/UserService';
import { User } from '@/models/User';
import connectDB from '@/lib/mongodb';
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

    const userService = new UserService(companyId);
    const isAdmin = await userService.isAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({ companyId })
      .sort({ level: -1, xp: -1 })
      .limit(100)
      .select('userId username name level xp badges roles stats createdAt');

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
