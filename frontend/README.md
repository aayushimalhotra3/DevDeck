# DevDeck Frontend

A Next.js application for building and sharing developer portfolios with GitHub integration.

## Features

- 🔐 GitHub OAuth authentication with NextAuth.js
- 📊 Real-time GitHub data integration
- 🎨 Drag & drop portfolio editor
- 📱 Responsive design with Tailwind CSS
- 🚀 Real-time preview with WebSocket updates

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

#### Required Environment Variables:

- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: A random secret key for NextAuth.js
- `NEXT_PUBLIC_GITHUB_CLIENT_ID`: GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth App Client Secret
- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL
- `NEXT_PUBLIC_WEBSOCKET_URL`: WebSocket server URL

### 3. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: DevDeck
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local` file

### 4. Generate NextAuth Secret

```bash
# Generate a random secret
openssl rand -base64 32
```

Add this to your `.env.local` as `NEXTAUTH_SECRET`.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXTAUTH_URL`: Your production URL
   - `NEXTAUTH_SECRET`: Same secret from development
   - `NEXT_PUBLIC_GITHUB_CLIENT_ID`: GitHub OAuth Client ID
   - `GITHUB_CLIENT_SECRET`: GitHub OAuth Client Secret
   - `NEXT_PUBLIC_BACKEND_URL`: Your backend API URL
   - `NEXT_PUBLIC_WEBSOCKET_URL`: Your WebSocket server URL

4. Update GitHub OAuth App settings:
   - **Homepage URL**: Your Vercel domain
   - **Authorization callback URL**: `https://your-domain.vercel.app/api/auth/callback/github`

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/auth/          # NextAuth.js API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── Navigation.tsx   # Navigation component
│   └── providers/       # Context providers
├── types/               # TypeScript type definitions
├── middleware.ts        # Next.js middleware for auth
└── next.config.js      # Next.js configuration
```

## Authentication Flow

1. User visits the home page
2. If not authenticated, they see the landing page with login button
3. Clicking "Get Started with GitHub" redirects to `/login`
4. Login page initiates GitHub OAuth flow
5. After successful authentication, user is redirected to `/dashboard`
6. Dashboard displays user info and GitHub repositories
7. Protected routes are secured with middleware

## Technologies Used

- **Framework**: Next.js 14 with App Router
- **Authentication**: NextAuth.js with GitHub Provider
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **TypeScript**: Full type safety
- **Linting**: ESLint + Prettier
- **Icons**: Lucide React

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
