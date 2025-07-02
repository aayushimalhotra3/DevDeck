# DevDeck Backend API

A comprehensive portfolio management system with AI-powered features, premium subscriptions, and advanced analytics.

## 🚀 Features

### Core Features
- **Portfolio Management**: Create, edit, and publish developer portfolios
- **GitHub Integration**: Automatic project import from GitHub repositories
- **Real-time Updates**: WebSocket-powered live preview and collaboration
- **Public Portfolios**: SEO-optimized public portfolio pages
- **Analytics**: Comprehensive portfolio analytics and insights

### Week 5 New Features
- **Export Functionality**: Export portfolios to JSON, Markdown, and PDF formats
- **AI-Powered Features**: OpenAI integration for content suggestions and optimization
- **Premium Subscriptions**: Stripe-powered subscription management
- **Performance Optimizations**: Redis caching, compression, and monitoring
- **Advanced Analytics**: Detailed traffic and engagement metrics

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + GitHub OAuth
- **Real-time**: Socket.io
- **Caching**: Redis
- **AI**: OpenAI GPT-3.5/4
- **Payments**: Stripe
- **PDF Generation**: Puppeteer
- **Security**: Helmet, Rate Limiting
- **Performance**: Compression, Monitoring

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Redis (optional, for caching)
- GitHub OAuth App
- OpenAI API Key (optional, for AI features)
- Stripe Account (optional, for premium features)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devdeck/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following required variables:
   ```env
   # Required
   MONGODB_URI=mongodb://localhost:27017/devdeck
   JWT_SECRET=your-super-secret-jwt-key
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Optional (for enhanced features)
   REDIS_URL=redis://localhost:6379
   OPENAI_API_KEY=your-openai-api-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Routes
- `POST /auth/github` - GitHub OAuth login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Portfolio Routes
- `GET /api/portfolio` - Get user's portfolio
- `PUT /api/portfolio` - Update portfolio
- `POST /api/portfolio/publish` - Publish portfolio
- `POST /api/portfolio/unpublish` - Unpublish portfolio
- `GET /api/portfolio/public/:username` - Get public portfolio
- `GET /api/portfolio/discover` - Discover public portfolios
- `GET /api/portfolio/analytics` - Get portfolio analytics

### Export Routes (New)
- `GET /api/export/json` - Export portfolio as JSON
- `GET /api/export/markdown` - Export portfolio as Markdown
- `GET /api/export/pdf` - Export portfolio as PDF

### AI Routes (New)
- `POST /api/ai/suggestions` - Get AI content suggestions
- `POST /api/ai/optimize` - Get portfolio optimization advice
- `POST /api/ai/seo` - Generate SEO metadata
- `GET /api/ai/usage` - Get AI usage statistics

### Premium Routes (New)
- `GET /api/premium/plans` - Get subscription plans
- `GET /api/premium/subscription` - Get user subscription
- `POST /api/premium/checkout` - Create checkout session
- `POST /api/premium/cancel` - Cancel subscription
- `GET /api/premium/analytics/advanced` - Advanced analytics (Premium)
- `GET /api/premium/themes` - Premium themes (Premium)

### GitHub Routes
- `GET /api/github/repos` - Get user repositories
- `GET /api/github/repos/pinned` - Get pinned repositories
- `GET /api/github/user` - Get GitHub user data

### User Routes
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## 🔒 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: API request throttling
- **Speed Limiting**: Progressive delays for excessive requests
- **CORS**: Cross-origin resource sharing protection
- **JWT**: Secure authentication tokens
- **Input Validation**: Request data validation

## ⚡ Performance Features

- **Redis Caching**: API response caching
- **Compression**: Gzip compression for responses
- **Database Optimization**: Connection pooling and indexing
- **Image Optimization**: Automatic image caching headers
- **Performance Monitoring**: Request timing and memory usage
- **Health Checks**: Comprehensive system health monitoring

## 🤖 AI Features

### Content Suggestions
- **Bio Generation**: AI-powered bio suggestions based on GitHub activity
- **Project Descriptions**: Enhanced project descriptions
- **Skills Extraction**: Automatic skill identification from repositories
- **Portfolio Optimization**: Comprehensive portfolio analysis and suggestions

### Usage Limits
- **Free Tier**: 5 AI suggestions per month
- **Pro Tier**: 100 AI suggestions per month
- **Enterprise Tier**: Unlimited AI suggestions

## 💳 Premium Features

### Subscription Plans

#### Free Plan
- Basic portfolio builder
- GitHub integration
- Public portfolio sharing
- Basic analytics
- 5 AI suggestions/month

#### Pro Plan ($9.99/month)
- Everything in Free
- Unlimited portfolios
- Custom domains
- Advanced analytics
- 100 AI suggestions/month
- Premium themes
- Export to PDF/Markdown
- Priority support

#### Enterprise Plan ($29.99/month)
- Everything in Pro
- Team collaboration
- White-label solutions
- API access
- Unlimited AI suggestions
- Dedicated support
- SSO integration

## 📊 Analytics

### Basic Analytics (Free)
- Total views
- Unique views
- Last viewed date
- Portfolio status

### Advanced Analytics (Premium)
- Daily view trends
- Traffic sources
- Device and browser analytics
- Engagement metrics
- Performance scores
- Goal tracking

## 🔄 Export Formats

### JSON Export
- Complete portfolio data
- User information
- Metadata and timestamps
- Structured for easy import

### Markdown Export
- Human-readable format
- GitHub-compatible
- Includes all portfolio sections
- Social links and contact info

### PDF Export
- Professional layout
- Print-ready format
- Styled with CSS
- Includes images and branding

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:

```env
# Production settings
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

# Database
MONGODB_URI=mongodb://your-mongodb-uri

# Security
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-session-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://your-domain.com/auth/github/callback

# Optional services
REDIS_URL=your-redis-url
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-secret
```

### Health Check
Monitor your deployment with the health endpoint:
```
GET /health
```

Returns system status, uptime, memory usage, and service connectivity.

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint
```

## 📝 Development

### Code Structure
```
src/
├── config/          # Database and service configurations
├── middleware/      # Express middleware
├── models/          # MongoDB models
├── routes/          # API route handlers
├── utils/           # Utility functions and helpers
├── server.js        # Main server file
└── ws.js           # WebSocket configuration
```

### Adding New Features
1. Create route handlers in `routes/`
2. Add middleware if needed in `middleware/`
3. Update models in `models/`
4. Add utilities in `utils/`
5. Update server.js to include new routes
6. Add environment variables to `.env.example`
7. Update this README

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

**DevDeck Backend API** - Empowering developers to showcase their work with AI-powered portfolio management.