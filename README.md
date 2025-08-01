# Supabase Auth App

A Next.js application with Supabase authentication featuring sign-up, login, and user dashboard functionality.

## Features

- 🔐 **Authentication**: Sign up and login with email/password
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔄 **Real-time**: Automatic session management and state updates
- 🛡️ **Secure**: Built with Supabase's secure authentication system

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend as a Service with authentication
- **React Hooks** - State management and side effects

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install Dependencies

```bash
cd supabase-auth-app
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Settings > API in your Supabase dashboard
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Make sure there are no quotes around the values and no spaces around the `=` sign.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication page
│   ├── dashboard/         # Protected dashboard page
│   └── layout.tsx         # Root layout with AuthProvider
├── components/            # React components
│   ├── Dashboard.tsx      # User dashboard component
│   ├── Login.tsx          # Login form component
│   └── SignUp.tsx         # Sign up form component
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
└── lib/                   # Utility libraries
    └── supabase.ts        # Supabase client configuration
```

## Usage

### Authentication Flow

1. **Landing Page**: Users see a welcome screen with a "Get Started" button
2. **Auth Page**: Users can switch between Login and Sign Up tabs
3. **Dashboard**: Authenticated users see their profile and can sign out

### Features

- **Sign Up**: Email/password registration with email confirmation
- **Login**: Secure authentication with error handling
- **Dashboard**: User profile display with session information
- **Sign Out**: Secure logout functionality
- **Loading States**: Smooth loading indicators during auth operations
- **Error Handling**: User-friendly error messages

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |

## Troubleshooting

### Environment Variables Not Loading

If you see "Environment variables not configured" errors:

1. **Check file format**: Ensure `.env.local` has no quotes and no spaces around `=`
2. **Restart server**: Stop the dev server (Ctrl+C) and run `npm run dev` again
3. **Check file location**: Make sure `.env.local` is in the project root
4. **Verify variables**: Visit `http://localhost:3000/test-env` to check if they're loaded

### Common Issues

- **"supabaseUrl is required"**: Environment variables not loaded properly
- **"Missing Supabase environment variables"**: Check `.env.local` file format
- **Authentication errors**: Verify your Supabase project is active and credentials are correct

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Netlify (Recommended for this project)

1. **Push your code to GitHub**
2. **Connect your repository to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Connect your GitHub account and select this repository
3. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Add environment variables** in Netlify dashboard:
   - Go to Site settings > Environment variables
   - Add `NEXT_PUBLIC_SUPABASE_URL` with your Supabase project URL
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your Supabase anon key
5. **Deploy**: Netlify will automatically deploy your site

### Vercel (Alternative)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Security Considerations

- Environment variables are properly configured for client-side usage
- Supabase handles secure token management
- No sensitive data is stored in localStorage
- Authentication state is managed securely through Supabase

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
