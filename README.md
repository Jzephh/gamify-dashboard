# PowerLevel Dashboard

A Next.js web application that emulates the whop-bot functionality, providing a user-friendly interface for tracking XP, levels, badges, and quests.

## Features

### 🎯 User Profile
- Display user avatar, name, and username from Whop
- Show current level and XP with progress bar
- Track message statistics (total, success, voice minutes)
- Display earned badges with unlock status

### 🏆 Leveling System
- Automatic XP calculation based on message activity
- Level progression with visual progress bars
- Level up notifications with celebratory modal
- Badge unlocking based on level milestones

### 🎮 Quest System
- **Daily Quests:**
  - Send 10 messages (+15 XP)
  - Send 1 success message (+10 XP)
- **Weekly Quests:**
  - Send 100 messages (+50 XP)
  - Send 10 success messages (+50 XP)
- Real-time progress tracking
- Automatic quest completion detection

### 🛡️ Admin Panel
- View all users with their stats
- Award XP to specific users
- Manage badges (unlock/lock)
- Role-based access control

### 🎨 Modern UI
- Beautiful gradient backgrounds
- Glassmorphism design elements
- Responsive layout
- Smooth animations and transitions

## Technology Stack

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** Tailwind CSS, Radix UI components
- **Backend:** Next.js API routes
- **Database:** MongoDB with Mongoose
- **Authentication:** Whop SDK integration
- **Icons:** Lucide React

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env.local` file with:
   ```env
   # Whop API Credentials
   WHOP_API_KEY=your_whop_api_key
   NEXT_PUBLIC_WHOP_APP_ID=your_app_id
   NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_agent_user_id
   NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id

   # Database Configuration
   MONGO_URI=your_mongodb_connection_string
   MONGO_DB=your_database_name

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run the development server:**
```bash
npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Database Schema

### User Model
```typescript
{
  companyId: string;
  userId: string;
  username: string;
  name: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  points: number;
  badges: {
    bronze: boolean;
    silver: boolean;
    gold: boolean;
    platinum: boolean;
    apex: boolean;
  };
  roles: string[];
  stats: {
    messages: number;
    successMessages: number;
    voiceMinutes: number;
  };
  levelUpSeen: boolean;
}
```

### Quest Progress Model
```typescript
{
  companyId: string;
  userId: string;
  dateKey: string; // YYYY-MM-DD for daily, YYYY-WW for weekly
  type: 'daily' | 'weekly';
  msgCount: number;
  successMsgCount: number;
  completed: {
    send10?: boolean;
    success1?: boolean;
    send100?: boolean;
    success10?: boolean;
  };
}
```

## API Endpoints

### Authentication
- `GET /api/auth/verify` - Verify user token with Whop

### User Management
- `GET /api/user/profile` - Get user profile data
- `GET /api/user/quests` - Get quest progress
- `POST /api/user/levelup-seen` - Mark level up as seen
- `POST /api/user/simulate-message` - Simulate message for testing

### Admin Functions
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/award-xp` - Award XP to user (admin only)
- `POST /api/admin/badges` - Manage user badges (admin only)

## Badge System

Badges are automatically unlocked based on level progression:

- **🥉 Bronze:** Level 1
- **🥈 Silver:** Level 5
- **🥇 Gold:** Level 10
- **💎 Platinum:** Level 20
- **👑 Apex:** Admin-assigned role

## Quest System

### Daily Quests (Reset at midnight)
- Send 10 messages → +15 XP
- Send 1 success message → +10 XP

### Weekly Quests (Reset on Monday)
- Send 100 messages → +50 XP
- Send 10 success messages → +50 XP

## XP Calculation

- **Regular Message:** +5 XP
- **Success Message:** +15 XP (5 base + 10 bonus)
- **Cooldown:** 30 seconds between XP awards

## Admin Features

Admins (users with roles) can:
- View all users and their statistics
- Award custom XP amounts to any user
- Unlock/lock badges for any user
- Monitor user activity and progression

## Development

### Testing
Use the "Simulate Activity" buttons in the Profile tab to test:
- Regular message simulation (+5 XP)
- Success message simulation (+15 XP)

### Database Connection
The app automatically connects to MongoDB and creates necessary collections and indexes.

### Error Handling
Comprehensive error handling for:
- Authentication failures
- Database connection issues
- API rate limiting
- Invalid user data

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

3. Ensure environment variables are set in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.