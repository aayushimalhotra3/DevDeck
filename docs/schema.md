# Database Schema Documentation

This document provides a comprehensive overview of the DevDeck database models and their relationships.

## Overview

DevDeck uses MongoDB with Mongoose ODM for data modeling. The application consists of three main collections:

- **Users**: Store user authentication and profile information
- **Portfolios**: Store portfolio configurations and content
- **Blocks**: Store individual portfolio blocks (embedded in portfolios)

## Models

### User Model

**Collection**: `users`
**File**: `backend/src/models/User.js`

#### Schema Structure

```javascript
{
  // GitHub OAuth data
  githubId: String (required, unique),
  username: String (required, unique, lowercase, 3-30 chars),
  email: String (required, unique, lowercase),
  name: String (required, max 100 chars),
  avatar_url: String (required),
  
  // Profile information
  bio: String (max 500 chars),
  location: String (max 100 chars),
  website: String (max 200 chars),
  twitter: String (max 50 chars),
  linkedin: String (max 200 chars),
  
  // GitHub data
  github_data: {
    public_repos: Number,
    followers: Number,
    following: Number,
    company: String,
    blog: String,
    hireable: Boolean
  },
  
  // Privacy settings
  privacy: {
    publicProfile: Boolean (default: true),
    showEmail: Boolean (default: false),
    showLocation: Boolean (default: true),
    allowIndexing: Boolean (default: true)
  },
  
  // Portfolio settings
  portfolio: {
    isPublished: Boolean (default: false),
    customDomain: String,
    theme: String (default: 'default'),
    analytics: Boolean (default: false)
  },
  
  // Access tokens (encrypted, not selected by default)
  tokens: {
    github_access_token: String,
    refresh_token: String
  },
  
  // Metadata
  lastLogin: Date (default: now),
  isActive: Boolean (default: true),
  role: String (enum: ['user', 'admin'], default: 'user'),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes

- `username: 1`
- `email: 1`
- `githubId: 1`
- `portfolio.isPublished: 1`

#### Methods

- `toPublicJSON()`: Returns sanitized user data for public display
- `updateLastLogin()`: Updates the last login timestamp

#### Static Methods

- `findByGithubId(githubId)`: Find user by GitHub ID
- `findByUsername(username)`: Find user by username
- `isUsernameTaken(username, excludeUserId)`: Check if username is available

#### Virtual Fields

- `portfolioUrl`: Computed portfolio URL

---

### Portfolio Model

**Collection**: `portfolios`
**File**: `backend/src/models/Portfolio.js`

#### Schema Structure

```javascript
{
  userId: ObjectId (ref: 'User', required, unique),
  
  // Portfolio content (embedded blocks)
  blocks: [{
    id: String (required),
    type: String (enum: ['bio', 'projects', 'skills', 'blog', 'experience', 'education', 'contact', 'testimonials', 'resume']),
    content: Mixed (required),
    position: {
      x: Number (default: 0),
      y: Number (default: 0)
    },
    order: Number (default: 0),
    isVisible: Boolean (default: true),
    settings: Mixed (default: {})
  }],
  
  // Layout and design
  layout: {
    type: String (enum: ['grid', 'masonry', 'single-column'], default: 'grid'),
    columns: Number (1-4, default: 2),
    spacing: String (enum: ['compact', 'normal', 'spacious'], default: 'normal')
  },
  
  // Theme and styling
  theme: {
    name: String (default: 'default'),
    primaryColor: String (default: '#3b82f6'),
    backgroundColor: String (default: '#ffffff'),
    fontFamily: String (default: 'Inter'),
    customCSS: String (max 10000 chars)
  },
  
  // SEO and metadata
  seo: {
    title: String (max 60 chars),
    description: String (max 160 chars),
    keywords: [String] (max 50 chars each),
    ogImage: String
  },
  
  // Analytics and tracking
  analytics: {
    googleAnalyticsId: String,
    enableTracking: Boolean (default: false)
  },
  
  // Portfolio status
  status: String (enum: ['draft', 'published', 'archived'], default: 'draft'),
  
  // Version control
  version: Number (default: 1),
  
  // Statistics
  stats: {
    views: Number (default: 0),
    uniqueViews: Number (default: 0),
    lastViewed: Date,
    shares: Number (default: 0)
  },
  
  // Publishing settings
  publishing: {
    publishedAt: Date,
    customDomain: String,
    isIndexable: Boolean (default: true),
    passwordProtected: Boolean (default: false),
    password: String (not selected by default)
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Indexes

- `userId: 1`
- `status: 1`
- `publishing.publishedAt: -1`
- `stats.views: -1`

#### Methods

- `incrementViews(isUnique)`: Increment view counters
- `publish()`: Publish the portfolio
- `unpublish()`: Unpublish the portfolio
- `addBlock(blockData)`: Add a new block
- `updateBlock(blockId, updateData)`: Update existing block
- `removeBlock(blockId)`: Remove a block
- `reorderBlocks(blockOrders)`: Reorder blocks

#### Static Methods

- `findByUserId(userId)`: Find portfolio by user ID
- `findPublishedByUsername(username)`: Find published portfolio by username
- `getPublishedPortfolios(limit, skip)`: Get paginated published portfolios

#### Virtual Fields

- `url`: Computed portfolio URL

---

### Block Model

**Collection**: `blocks`
**File**: `backend/src/models/Block.js`

#### Schema Structure

```javascript
{
  // Block identification
  id: String (required, unique),
  
  // Block type
  type: String (enum: ['bio', 'projects', 'skills', 'experience', 'education', 'contact', 'blog'], required),
  
  // Block content (varies by type)
  content: Mixed (required, validated based on type),
  
  // Layout and positioning
  position: {
    x: Number (default: 0),
    y: Number (default: 0),
    width: Number (default: 1),
    height: Number (default: 1)
  },
  
  // Display order
  order: Number (default: 0),
  
  // Visibility
  isVisible: Boolean (default: true),
  
  // Block-specific settings
  settings: {
    // Styling
    backgroundColor: String,
    textColor: String,
    borderRadius: String (default: 'md'),
    shadow: String (default: 'sm'),
    padding: String (default: 'md'),
    
    // Animation
    animation: {
      type: String (enum: ['none', 'fade', 'slide', 'scale'], default: 'none'),
      duration: Number (default: 300),
      delay: Number (default: 0)
    },
    
    // Responsive behavior
    responsive: {
      hideOnMobile: Boolean (default: false),
      hideOnTablet: Boolean (default: false),
      mobileOrder: Number (default: 0)
    }
  },
  
  // Metadata
  portfolioId: ObjectId (ref: 'Portfolio', required),
  createdBy: ObjectId (ref: 'User', required),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### Content Schemas by Block Type

##### Bio Block Content
```javascript
{
  title: String (max 100 chars),
  description: String (max 1000 chars),
  avatar: String,
  skills: [String] (max 50 chars each),
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    website: String,
    email: String
  }
}
```

##### Projects Block Content
```javascript
{
  title: String (required, max 100 chars),
  description: String (max 500 chars),
  image: String,
  technologies: [String] (max 30 chars each),
  links: {
    github: String,
    live: String,
    demo: String
  },
  featured: Boolean (default: false),
  stats: {
    stars: Number (default: 0),
    forks: Number (default: 0),
    language: String
  }
}
```

##### Skills Block Content
```javascript
{
  categories: [{
    name: String (required, max 50 chars),
    skills: [{
      name: String (required, max 50 chars),
      level: String (enum: ['beginner', 'intermediate', 'advanced', 'expert']),
      icon: String,
      color: String (default: '#3b82f6')
    }]
  }]
}
```

##### Experience Block Content
```javascript
{
  items: [{
    title: String (required, max 100 chars),
    company: String (required, max 100 chars),
    location: String (max 100 chars),
    startDate: Date (required),
    endDate: Date,
    current: Boolean (default: false),
    description: String (max 1000 chars),
    technologies: [String] (max 30 chars each),
    achievements: [String] (max 200 chars each)
  }]
}
```

##### Education Block Content
```javascript
{
  items: [{
    degree: String (required, max 100 chars),
    institution: String (required, max 100 chars),
    location: String (max 100 chars),
    startDate: Date (required),
    endDate: Date,
    current: Boolean (default: false),
    gpa: String (max 10 chars),
    description: String (max 500 chars),
    achievements: [String] (max 200 chars each)
  }]
}
```

##### Contact Block Content
```javascript
{
  title: String (max 100 chars, default: 'Get In Touch'),
  description: String (max 500 chars),
  email: String,
  phone: String (max 20 chars),
  location: String (max 100 chars),
  availability: {
    status: String (enum: ['available', 'busy', 'unavailable']),
    message: String (max 200 chars)
  },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    website: String
  }
}
```

##### Blog Block Content
```javascript
{
  posts: [{
    title: String (required, max 100 chars),
    excerpt: String (max 300 chars),
    url: String (required),
    publishedAt: Date (required),
    tags: [String] (max 30 chars each),
    readTime: Number (default: 5),
    featured: Boolean (default: false)
  }],
  rssUrl: String,
  platform: String (enum: ['medium', 'dev.to', 'hashnode', 'custom'])
}
```

#### Indexes

- `portfolioId: 1, order: 1`
- `type: 1`
- `createdBy: 1`
- `isVisible: 1`

#### Methods

- `updateContent(newContent)`: Update block content
- `updatePosition(newPosition)`: Update block position
- `updateSettings(newSettings)`: Update block settings
- `toggleVisibility()`: Toggle block visibility

#### Static Methods

- `findByPortfolio(portfolioId)`: Find blocks by portfolio
- `findByType(type, portfolioId)`: Find blocks by type
- `getBlockTypes()`: Get available block types

#### Virtual Fields

- `url`: Computed block URL

---

## Relationships

### User → Portfolio
- **Type**: One-to-One
- **Relationship**: `Portfolio.userId` references `User._id`
- **Constraint**: Each user can have only one portfolio

### Portfolio → Blocks
- **Type**: One-to-Many (Embedded)
- **Relationship**: Blocks are embedded within Portfolio documents
- **Constraint**: Blocks are stored as an array within the portfolio

### User → Blocks
- **Type**: One-to-Many
- **Relationship**: `Block.createdBy` references `User._id`
- **Constraint**: Tracks which user created each block

---

## Data Validation

### User Validation
- Username: 3-30 characters, lowercase, unique
- Email: Valid email format, unique
- GitHub ID: Required, unique
- Bio: Maximum 500 characters
- Social links: URL format validation

### Portfolio Validation
- Theme colors: Valid hex color format
- Custom CSS: Maximum 10,000 characters
- SEO title: Maximum 60 characters
- SEO description: Maximum 160 characters
- Layout columns: 1-4 range

### Block Validation
- Content validation based on block type
- Position coordinates: Numeric values
- Animation duration: Positive numbers
- Text fields: Character limits per field

---

## Security Considerations

### Sensitive Data
- Access tokens are marked with `select: false`
- Passwords are excluded from JSON output
- User privacy settings control data exposure

### Data Sanitization
- All user inputs are validated and sanitized
- Custom CSS is limited to prevent XSS
- URLs are validated for proper format

### Access Control
- Users can only modify their own portfolios
- Admin role for system administration
- Portfolio visibility controlled by status and privacy settings

---

## Performance Optimizations

### Indexing Strategy
- Primary lookups: username, email, githubId
- Portfolio queries: userId, status, publishedAt
- Block queries: portfolioId, type, visibility
- Analytics: view counts for trending

### Data Structure
- Embedded blocks for atomic portfolio operations
- Separate block collection for advanced querying
- Denormalized user data in portfolios for performance

### Caching Considerations
- Published portfolios can be cached
- User profile data suitable for caching
- Block content changes invalidate portfolio cache

---

## Migration Notes

### Schema Evolution
- Version field tracks portfolio changes
- Backward compatibility for block content
- Graceful handling of missing fields

### Data Migration Scripts
- User data migration from OAuth providers
- Portfolio structure updates
- Block type additions and modifications

---

## Backup and Recovery

### Backup Strategy
- Daily automated backups of all collections
- Point-in-time recovery capability
- Separate backup of user tokens (encrypted)

### Data Retention
- Soft delete for user accounts
- Portfolio history preservation
- Analytics data aggregation and archival