# DevDeck 🚀

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kathanparagshah/DevDeck)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/devdeck)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A modern platform for developers to create beautiful, interactive portfolios from their GitHub repositories with real-time editing capabilities.

## 🌐 Live Demo

- **Frontend**: [https://devdeck.vercel.app](https://devdeck.vercel.app)
- **API**: [https://devdeck-api.railway.app](https://devdeck-api.railway.app)
- **Documentation**: [https://devdeck.vercel.app/docs](https://devdeck.vercel.app/docs)

## ✨ Features

- **GitHub Integration**: Seamlessly connect your GitHub account and import repositories
- **Drag & Drop Editor**: Intuitive interface for building your portfolio
- **Real-time Preview**: See changes instantly with WebSocket-powered live updates
- **Responsive Design**: Beautiful portfolios that work on all devices
- **Custom Themes**: Personalize your portfolio with custom colors and layouts
- **SEO Optimized**: Built-in SEO features for better discoverability
- **Analytics**: Track portfolio views and visitor engagement
- **Custom Domains**: Use your own domain for your portfolio

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful and accessible UI components
- **React DnD** - Drag and drop functionality
- **Framer Motion** - Smooth animations
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication
- **GitHub OAuth** - Social authentication

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- MongoDB (local or cloud)
- GitHub OAuth App

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/devdeck.git
   cd devdeck
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   npm run setup:env
   ```

4. **Configure environment files**
   
   **Backend (.env)**:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/devdeck
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
   
   # CORS
   FRONTEND_URL=http://localhost:3000
   ```
   
   **Frontend (.env.local)**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_WS_URL=http://localhost:5000
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

## 📁 Project Structure

```
devdeck/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # User dashboard
│   │   ├── edit/          # Portfolio editor
│   │   ├── preview/       # Portfolio preview
│   │   └── settings/      # User settings
│   ├── components/         # React components
│   │   ├── ui/            # Shadcn/ui components
│   │   ├── DragEditor.tsx # Drag & drop editor
│   │   ├── LivePreview.tsx# Real-time preview
│   │   └── ProjectCard.tsx# GitHub project cards
│   └── lib/               # Utility functions
├── backend/                # Node.js backend application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── server.js      # Express server
│   └── package.json
└── package.json           # Root package.json
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Building
npm run build            # Build both applications
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend

# Testing
npm run test             # Run all tests
npm run test:frontend    # Run frontend tests
npm run test:backend     # Run backend tests

# Linting
npm run lint             # Lint all code
npm run lint:frontend    # Lint frontend
npm run lint:backend     # Lint backend

# Utilities
npm run clean            # Clean node_modules and build files
npm run setup            # Install dependencies and setup env files
```

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the following:
   - **Application name**: DevDeck
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`
4. Copy the Client ID and Client Secret to your environment files

### Database Setup

**Local MongoDB:**
```bash
# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**MongoDB Atlas (Cloud):**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and add to `MONGODB_URI`

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)

1. Create new project on Railway or Heroku
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Environment Variables for Production

Make sure to update URLs for production:
- `FRONTEND_URL`: Your frontend domain
- `GITHUB_REDIRECT_URI`: Your production callback URL
- `NEXTAUTH_URL`: Your frontend domain
- `NEXT_PUBLIC_API_URL`: Your backend domain
- `NEXT_PUBLIC_WS_URL`: Your backend domain

## 📖 API Documentation

### Authentication
- `POST /api/auth/github/callback` - GitHub OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### User Management
- `GET /api/user` - Get user profile
- `PUT /api/user` - Update user profile
- `GET /api/user/:username` - Get public user profile
- `PUT /api/user/username` - Update username
- `DELETE /api/user` - Delete user account

### Portfolio
- `GET /api/portfolio` - Get user's portfolio
- `PUT /api/portfolio` - Update portfolio
- `GET /api/portfolio/:username` - Get public portfolio
- `POST /api/portfolio/publish` - Publish portfolio
- `POST /api/portfolio/blocks` - Add portfolio block
- `PUT /api/portfolio/blocks/:blockId` - Update portfolio block
- `DELETE /api/portfolio/blocks/:blockId` - Delete portfolio block

### GitHub Integration
- `GET /api/github/repos` - Get user repositories
- `GET /api/github/repos/:owner/:repo` - Get specific repository
- `GET /api/github/profile` - Get GitHub profile
- `POST /api/github/sync` - Sync GitHub data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [GitHub API](https://docs.github.com/en/rest) for repository data
- [Socket.io](https://socket.io/) for real-time functionality
- [Next.js](https://nextjs.org/) for the amazing React framework

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

**Built with ❤️ by the DevDeck Team**