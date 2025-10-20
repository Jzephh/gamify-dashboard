import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { UserService } from '@/lib/services/UserService';
import { headers } from 'next/headers';
import { User } from '@/models/User';
import connectDB from '@/lib/mongodb';

export const runtime = 'nodejs';

// POST - Assign role to user
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

    // Check if user is admin
    const userService = new UserService(companyId);
    const isAdmin = await userService.isAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { targetUserId, roleName } = await request.json();
    
    if (!targetUserId || !roleName) {
      return NextResponse.json({ error: 'User ID and role name are required' }, { status: 400 });
    }

    await connectDB();
    
    const user = await User.findOne({ companyId, userId: targetUserId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add role if not already assigned
    if (!user.roles.includes(roleName)) {
      user.roles.push(roleName);
      await user.save();
    }

    return NextResponse.json({ success: true, roles: user.roles });
  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove role from user
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    const roleName = searchParams.get('roleName');
    
    if (!targetUserId || !roleName) {
      return NextResponse.json({ error: 'User ID and role name are required' }, { status: 400 });
    }

    await connectDB();
    
    const user = await User.findOne({ companyId, userId: targetUserId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove role from user
    user.roles = user.roles.filter((role: string) => role !== roleName);
    await user.save();

    return NextResponse.json({ success: true, roles: user.roles });
  } catch (error) {
    console.error('Error removing role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
