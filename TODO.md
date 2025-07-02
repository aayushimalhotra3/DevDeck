# DevDeck Development TODO & Roadmap

## Team Roles
- **Aayushi (Person B)**: Backend + Real-time + Infrastructure
- **Kathan (Person A)**: Frontend + GitHub UI + Authentication

---

## 🔧 Phase 0: Setup & Planning (Day 1–2)

### Aayushi Tasks:
- [x] Set up `backend/` folder with Express.js
- [x] Initialize MongoDB database and write initial schema
  - [x] `User` model (username, avatar, github_token, etc.)
  - [x] `Portfolio` model (blocks, theme, isPublic)
  - [x] `Block` model (type, content, position)
  - [x] `Theme` model (colors, fonts, layout)
- [x] Create base WebSocket server file (`ws.js`)
- [x] Add comprehensive `.env.example` for backend secrets
- [x] Set up database connection and basic middleware

### Kathan Tasks:
- [x] Set up GitHub repo `devdeck` with proper structure
- [x] Create `frontend/` with Next.js App Router + Tailwind + Shadcn
- [x] Build base page structure:
  - [x] `/dashboard` - User dashboard
  - [x] `/edit` - Portfolio editor
  - [x] `/preview/[username]` - Public portfolio view
- [ ] Set up GitHub project board (kanban style)
- [x] Configure ESLint, Prettier, and TypeScript

---

## 🧪 Week 1: Authentication & Dashboard

### Aayushi Tasks:
- [x] Build backend route for GitHub OAuth callback
- [x] Implement Passport.js GitHub strategy (using direct OAuth implementation)
- [x] Store GitHub token securely in database
- [x] Create login session management
- [x] Add user model with required fields:
  - [x] `username`, `email`, `avatar_url`
  - [x] `github_token`, `github_id`
  - [x] `created_at`, `updated_at`
- [x] Test session verification middleware
- [x] Create basic API routes:
  - [x] `POST /auth/github`
  - [x] `GET /auth/user`
  - [x] `POST /auth/logout`

### Kathan Tasks:
- [x] Implement GitHub OAuth using NextAuth.js
- [x] Create login page with GitHub OAuth button
- [x] Set up session management on frontend
- [x] Build `/dashboard` page:
  - [x] Display user avatar and GitHub info
  - [x] Show portfolio creation/edit options
  - [x] Add navigation menu
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render/Railway/GCP
- [ ] Test end-to-end authentication flow

---

## 🎨 Week 2: Portfolio Editor + Live Preview

### Aayushi Tasks:
- [x] Implement WebSocket backend logic:
  - [x] Connection management
  - [x] Real-time state synchronization
  - [x] Broadcast updates to connected clients
- [x] Create portfolio API endpoints:
  - [x] `POST /api/portfolio/save` - Save portfolio data
  - [x] `GET /api/portfolio/:id` - Get portfolio by ID
  - [x] `PUT /api/portfolio/:id` - Update portfolio
- [x] Store blocks in database as JSON:
  - [x] `bio`, `project`, `skills`, `experience` blocks
  - [x] Block positioning and styling data
- [x] Implement autosave functionality with debouncing
- [x] Add data validation and error handling

### Kathan Tasks:
- [x] Build `/edit` page with drag-and-drop functionality:
  - [x] Use `react-dnd` or `framer-motion` for DnD
  - [x] Create draggable block components
  - [x] Implement drop zones and reordering
- [x] Create live preview pane:
  - [x] Real-time updates via WebSocket
  - [x] Responsive preview modes (desktop/tablet/mobile)
- [x] Style editor interface with Tailwind + Shadcn:
  - [x] Block palette/sidebar
  - [x] Property panels for block customization
  - [x] Toolbar with save/undo/redo actions
- [ ] Implement autosave with visual feedback
- [ ] Add keyboard shortcuts for common actions

---

## 🔍 Week 3: GitHub Integration

### Aayushi Tasks:
 - [x] Create GitHub API integration routes:
   - [x] `GET /api/github/repos` - Fetch user repositories
   - [x] `GET /api/github/repos/pinned` - Get pinned repositories
   - [x] `GET /api/github/user` - Get GitHub user data
   - [x] `GET /api/github/repos/projects` - Get repositories formatted as project blocks
   - [x] `GET /api/github/repos/:owner/:repo` - Get specific repository details
 - [x] Parse repository data:
   - [x] README content extraction
   - [x] Repository metadata (stars, forks, language)
   - [x] Last updated timestamps
   - [x] Language statistics and percentages
 - [x] Format data into `project` block schema
 - [x] Implement caching for GitHub API responses
 - [x] Add rate limiting for GitHub API calls

### Kathan Tasks:
- [ ] Build "Import from GitHub" UI in `/edit`:
  - [ ] Repository selection interface
  - [ ] Preview of imported data
  - [ ] Bulk import functionality
- [x] Create project card components:
  - [x] Repository information display
  - [x] Stars, forks, and language badges
  - [x] Last updated indicators
  - [x] Custom project descriptions
- [x] Style project cards with:
  - [x] Technology badges
  - [x] GitHub icons and branding
  - [x] Hover effects and animations
- [ ] Add project filtering and sorting options

---

## 💾 Week 4: Save, Deploy, Public Portfolio

### Aayushi Tasks:
- [x] Create portfolio publishing system:
  - [x] `POST /api/portfolio/publish` - Publish portfolio
  - [x] `POST /api/portfolio/unpublish` - Unpublish portfolio
  - [x] `GET /api/portfolio/public/:username` - Get public portfolio
- [x] Add database schema updates:
  - [x] `isPublic: boolean` field (implemented as status field)
  - [x] `publishedAt: Date` field
  - [x] `customDomain: string` field (optional)
- [x] Implement portfolio URL generation
- [x] Add SEO metadata generation
- [x] Create portfolio analytics tracking
- [x] **BONUS**: Added `GET /api/portfolio/discover` - Public portfolio discovery with search and filtering

### Kathan Tasks:
- [x] Add publish/unpublish toggle in settings:
  - [x] Settings page creation
  - [x] Privacy controls
  - [x] Portfolio URL display
- [x] Create public portfolio layout (`/preview/[username]`):
  - [x] Responsive design for all devices
  - [x] SEO optimization with meta tags
  - [x] Social media sharing cards
- [ ] Implement theme system:
  - [ ] Light/dark mode toggle
  - [ ] Custom color schemes
  - [ ] Font selection options
- [ ] Add portfolio sharing features:
  - [ ] Copy link functionality
  - [ ] Social media sharing buttons
  - [ ] QR code generation

---

## 🛠️ Week 5: Final Touches & Bonuses

### Aayushi Tasks:
- [x] Add export functionality:
  - [x] Export to JSON format
  - [x] Export to Markdown
  - [x] Export to PDF (optional)
- [x] Integrate OpenAI API:
  - [x] Auto-generate bio from GitHub activity
  - [x] Project description enhancement
  - [x] Skills extraction from repositories
  - [x] Portfolio optimization suggestions
  - [x] SEO metadata generation
- [x] Optional premium features:
  - [x] Stripe integration setup
  - [x] Custom domain support
  - [x] Advanced analytics
  - [x] Premium themes
  - [x] Subscription management
- [x] Performance optimizations:
  - [x] Database indexing and optimization
  - [x] API response caching with Redis
  - [x] Image optimization
  - [x] Compression middleware
  - [x] Rate limiting and speed limiting
  - [x] Performance monitoring
  - [x] Health check endpoints

### Kathan Tasks:
- [ ] Add custom block types:
  - [ ] Testimonials block
  - [ ] Blog links integration
  - [ ] Resume upload functionality
  - [ ] Contact form block
- [ ] Implement "Clone Portfolio" feature:
  - [ ] Browse public portfolios
  - [ ] One-click cloning
  - [ ] Template marketplace
- [ ] Add animations and polish:
  - [ ] Loading states and skeletons
  - [ ] Smooth transitions
  - [ ] Tooltips and help text
  - [ ] Error boundaries
- [ ] Create landing page and marketing:
  - [ ] Homepage (`/`) with features showcase
  - [ ] About page with team info
  - [ ] Pricing page (if premium features)
  - [ ] Documentation and tutorials

---

## ✅ Collaboration Rules

### Git Workflow:
- [ ] Use branch naming convention:
  - `backend-*` for Aayushi's branches
  - `frontend-*` for Kathan's branches
- [ ] Create Pull Requests for all merges to main
- [ ] Include descriptive PR descriptions
- [ ] Require code review before merging
- [ ] Use conventional commit messages

### Project Management:
- [ ] Create GitHub Issues for each major task
- [ ] Assign issues to respective team members
- [ ] Use labels for categorization (frontend, backend, bug, feature)
- [ ] Update project board regularly
- [ ] Conduct weekly sync meetings

### Documentation:
- [ ] Maintain updated README.md with:
  - [ ] Deployed URL badges
  - [ ] Tech stack overview
  - [ ] Setup instructions
  - [ ] API documentation
- [ ] Create `/docs/schema.md` with database models
- [ ] Document environment variables
- [ ] Add code comments for complex logic

---

## 🚀 Deployment Checklist

### Production Setup:
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Domain names configured
- [ ] Monitoring and logging setup
- [ ] Backup strategies implemented
- [ ] Performance testing completed
- [ ] Security audit conducted

### Launch Preparation:
- [ ] Beta testing with select users
- [ ] Bug fixes and performance optimizations
- [ ] Final UI/UX polish
- [ ] Marketing materials prepared
- [ ] Social media accounts created
- [ ] Launch announcement ready

---

## 📊 Success Metrics

- [ ] User registration and retention rates
- [ ] Portfolio creation and publication rates
- [ ] GitHub integration usage
- [ ] Page load times and performance
- [ ] User feedback and satisfaction scores
- [ ] Feature adoption rates

---

*Last updated: $(date)*
*Next review: Weekly team sync*