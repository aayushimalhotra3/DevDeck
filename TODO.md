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
- [ ] Set up GitHub repo `devdeck` with proper structure
- [ ] Create `frontend/` with Next.js App Router + Tailwind + Shadcn
- [ ] Build base page structure:
  - [ ] `/dashboard` - User dashboard
  - [ ] `/edit` - Portfolio editor
  - [ ] `/preview/[username]` - Public portfolio view
- [ ] Set up GitHub project board (kanban style)
- [ ] Configure ESLint, Prettier, and TypeScript

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
- [ ] Implement GitHub OAuth using NextAuth.js
- [ ] Create login page with GitHub OAuth button
- [ ] Set up session management on frontend
- [ ] Build `/dashboard` page:
  - [ ] Display user avatar and GitHub info
  - [ ] Show portfolio creation/edit options
  - [ ] Add navigation menu
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
- [ ] Build `/edit` page with drag-and-drop functionality:
  - [ ] Use `react-dnd` or `framer-motion` for DnD
  - [ ] Create draggable block components
  - [ ] Implement drop zones and reordering
- [ ] Create live preview pane:
  - [ ] Real-time updates via WebSocket
  - [ ] Responsive preview modes (desktop/tablet/mobile)
- [ ] Style editor interface with Tailwind + Shadcn:
  - [ ] Block palette/sidebar
  - [ ] Property panels for block customization
  - [ ] Toolbar with save/undo/redo actions
- [ ] Implement autosave with visual feedback
- [ ] Add keyboard shortcuts for common actions

---

## 🔍 Week 3: GitHub Integration

### Aayushi Tasks:
- [ ] Create GitHub API integration routes:
  - [ ] `GET /api/github/repos` - Fetch user repositories
  - [ ] `GET /api/github/repos/pinned` - Get pinned repositories
  - [ ] `GET /api/github/user` - Get GitHub user data
- [ ] Parse repository data:
  - [ ] README content extraction
  - [ ] Repository metadata (stars, forks, language)
  - [ ] Last updated timestamps
- [ ] Format data into `project` block schema
- [ ] Implement caching for GitHub API responses
- [ ] Add rate limiting for GitHub API calls

### Kathan Tasks:
- [ ] Build "Import from GitHub" UI in `/edit`:
  - [ ] Repository selection interface
  - [ ] Preview of imported data
  - [ ] Bulk import functionality
- [ ] Create project card components:
  - [ ] Repository information display
  - [ ] Stars, forks, and language badges
  - [ ] Last updated indicators
  - [ ] Custom project descriptions
- [ ] Style project cards with:
  - [ ] Technology badges
  - [ ] GitHub icons and branding
  - [ ] Hover effects and animations
- [ ] Add project filtering and sorting options

---

## 💾 Week 4: Save, Deploy, Public Portfolio

### Aayushi Tasks:
- [ ] Create portfolio publishing system:
  - [ ] `POST /api/portfolio/publish` - Publish portfolio
  - [ ] `POST /api/portfolio/unpublish` - Unpublish portfolio
  - [ ] `GET /api/portfolio/public/:username` - Get public portfolio
- [ ] Add database schema updates:
  - [ ] `isPublic: boolean` field
  - [ ] `publishedAt: Date` field
  - [ ] `customDomain: string` field (optional)
- [ ] Implement portfolio URL generation
- [ ] Add SEO metadata generation
- [ ] Create portfolio analytics tracking

### Kathan Tasks:
- [ ] Add publish/unpublish toggle in settings:
  - [ ] Settings page creation
  - [ ] Privacy controls
  - [ ] Portfolio URL display
- [ ] Create public portfolio layout (`/preview/[username]`):
  - [ ] Responsive design for all devices
  - [ ] SEO optimization with meta tags
  - [ ] Social media sharing cards
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
- [ ] Add export functionality:
  - [ ] Export to JSON format
  - [ ] Export to Markdown
  - [ ] Export to PDF (optional)
- [ ] Integrate OpenAI API:
  - [ ] Auto-generate bio from GitHub activity
  - [ ] Project description enhancement
  - [ ] Skills extraction from repositories
- [ ] Optional premium features:
  - [ ] Stripe integration setup
  - [ ] Custom domain support
  - [ ] Advanced analytics
- [ ] Performance optimizations:
  - [ ] Database indexing
  - [ ] API response caching
  - [ ] Image optimization

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