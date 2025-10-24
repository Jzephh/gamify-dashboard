import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { UserService } from '@/lib/services/UserService';
import { User } from '@/models/User';
import connectDB from '@/lib/mongodb';
import { headers } from 'next/headers';
import { BOT_USER_ID } from '@/lib/constants';

export const runtime = 'nodejs';

export async function GET(request: Request) {
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

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    await connectDB();
    
    // Build query
    const query: Record<string, unknown> = { 
      companyId,
      userId: { $ne: BOT_USER_ID } // Exclude bot user
    };

    // Add search filter if provided
    if (search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const totalCount = await User.countDocuments(query);

    // Get users with pagination
    const users = await User.find(query)
      .sort({ level: -1, xp: -1 })
      .skip(offset)
      .limit(limit)
      .select('userId username name level xp badges roles stats createdAt');

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
