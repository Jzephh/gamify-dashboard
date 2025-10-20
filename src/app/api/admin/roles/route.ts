import { NextResponse } from 'next/server';
import { getWhopSdk } from '@/lib/whop';
import { UserService } from '@/lib/services/UserService';
import { headers } from 'next/headers';
import Role from '@/models/Role';
import connectDB from '@/lib/mongodb';

export const runtime = 'nodejs';

// GET - Get all roles
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

    await connectDB();
    // Silent cleanup: drop legacy index on roleId if it exists (from older schema)
    try {
      type IndexInfo = { name?: string; key?: Record<string, unknown> };
      const coll = Role.collection as unknown as {
        indexes: () => Promise<IndexInfo[]>;
        dropIndex: (name: string) => Promise<void>;
      };
      const idx = await coll.indexes();
      const legacy = idx.find(i => i?.name === 'roleId_1' || (i?.key && Object.prototype.hasOwnProperty.call(i.key, 'roleId')));
      if (legacy?.name) {
        await coll.dropIndex(legacy.name).catch(() => {});
      }
      await Role.syncIndexes().catch(() => {});
    } catch {
      // ignore
    }
    
    // Check if any roles exist for this company
    let roles = await Role.find({ companyId }).sort({ name: 1 });
    
    // If no roles exist, create a default Admin role
    if (roles.length === 0) {
      const adminRole = new Role({
        companyId,
        name: 'Admin',
        description: 'administrator role with full access',
      });
      await adminRole.save();
      roles = [adminRole];
    }

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new role
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

    const { name, description } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Validate input
    if (typeof name !== 'string') {
      return NextResponse.json({ error: 'Name must be a string' }, { status: 400 });
    }
    if (description != null && typeof description !== 'string') {
      return NextResponse.json({ error: 'Description must be a string' }, { status: 400 });
    }
    if (name.trim().length === 0) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }

    await connectDB();

    // Check if role name already exists
    const existingRole = await Role.findOne({ companyId, name });
    if (existingRole) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 });
    }

    const role = new Role({ companyId, name, description: description ?? '' });
    await role.save();
    return NextResponse.json(role);
  } catch (error: unknown) {
    // Duplicate key error handling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err: any = error;
    const message = (err && (err.message || err.errmsg)) || 'Unknown error';
    if (message.includes('E11000')) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 });
    }
    console.error('Error creating role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update role
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

    const { roleId, name, description } = await request.json();
    
    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    await connectDB();
    
    const role = await Role.findOne({ _id: roleId, companyId });
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Check if new name conflicts with existing role
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ companyId, name });
      if (existingRole) {
        return NextResponse.json({ error: 'Role name already exists' }, { status: 400 });
      }
    }

    // Update role
    if (name) role.name = name;
    if (description) role.description = description;

    await role.save();

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete role
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
    const roleId = searchParams.get('roleId');
    
    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    await connectDB();
    
    const role = await Role.findOne({ _id: roleId, companyId });
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Hard delete - remove the role completely
    await Role.deleteOne({ _id: roleId, companyId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
