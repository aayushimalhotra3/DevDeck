# DevDeck API Documentation

Comprehensive API documentation for the DevDeck backend service.

## Base URL

- **Production**: `https://devdeck-api.railway.app`
- **Development**: `http://localhost:5001`

## Authentication

DevDeck uses JWT (JSON Web Tokens) for authentication. Include the token in requests using one of these methods:

### Cookie Authentication (Recommended)
```http
Cookie: token=your_jwt_token_here
```

### Header Authentication
```http
Authorization: Bearer your_jwt_token_here
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 attempts per 15 minutes per IP
- **AI Endpoints**: Varies by subscription plan

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error information"
  }
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Authentication Endpoints

### Initiate GitHub OAuth

**POST** `/api/auth/github`

Initiates the GitHub OAuth flow by returning the authorization URL.

#### Request
```http
POST /api/auth/github
Content-Type: application/json
```

#### Response
```json
{
  "success": true,
  "data": {
    "authUrl": "https://github.com/login/oauth/authorize?client_id=..."
  }
}
```

### GitHub OAuth Callback

**POST** `/api/auth/github/callback`

Handles the GitHub OAuth callback and creates/updates user account.

#### Request
```http
POST /api/auth/github/callback
Content-Type: application/json

{
  "code": "github_authorization_code"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "github_username",
      "email": "user@example.com",
      "name": "User Name",
      "avatar": "https://avatars.githubusercontent.com/..."
    },
    "token": "jwt_token_here"
  }
}
```

### Get Current User

**GET** `/api/auth/me`

Returns the currently authenticated user's information.

#### Request
```http
GET /api/auth/me
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "github_username",
      "email": "user@example.com",
      "name": "User Name",
      "avatar": "https://avatars.githubusercontent.com/...",
      "bio": "User bio",
      "location": "User location",
      "website": "https://user-website.com",
      "company": "User Company"
    }
  }
}
```

### Logout

**POST** `/api/auth/logout`

Logs out the current user by clearing the authentication cookie.

#### Request
```http
POST /api/auth/logout
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Management

### Get User Profile

**GET** `/api/user/profile`

Returns the authenticated user's complete profile information.

#### Request
```http
GET /api/user/profile
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "github_username",
      "email": "user@example.com",
      "name": "User Name",
      "avatar": "https://avatars.githubusercontent.com/...",
      "bio": "User bio",
      "location": "User location",
      "website": "https://user-website.com",
      "company": "User Company",
      "githubProfile": {
        "login": "github_username",
        "url": "https://github.com/username",
        "publicRepos": 25,
        "followers": 100,
        "following": 50
      },
      "settings": {
        "privacy": {
          "showEmail": false,
          "showLocation": true
        },
        "notifications": {
          "email": true,
          "push": false
        }
      },
      "subscription": {
        "plan": "free",
        "status": "active"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Update User Profile

**PUT** `/api/user/profile`

Updates the authenticated user's profile information.

#### Request
```http
PUT /api/user/profile
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "name": "Updated Name",
  "bio": "Updated bio",
  "location": "Updated location",
  "website": "https://updated-website.com",
  "settings": {
    "privacy": {
      "showEmail": true,
      "showLocation": false
    }
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      // Updated user object
    }
  },
  "message": "Profile updated successfully"
}
```

---

## Portfolio Management

### Get User Portfolios

**GET** `/api/portfolios`

Returns all portfolios belonging to the authenticated user.

#### Request
```http
GET /api/portfolios
Authorization: Bearer your_jwt_token
```

#### Query Parameters
- `status` (optional): Filter by status (`draft`, `published`, `archived`)
- `limit` (optional): Number of portfolios to return (default: 10, max: 50)
- `offset` (optional): Number of portfolios to skip (default: 0)

#### Response
```json
{
  "success": true,
  "data": {
    "portfolios": [
      {
        "id": "portfolio_id",
        "title": "My Portfolio",
        "description": "Portfolio description",
        "slug": "my-portfolio",
        "status": "published",
        "theme": "modern",
        "layout": "grid",
        "blocks": [
          {
            "id": "block_id",
            "type": "bio",
            "order": 1,
            "visible": true,
            "content": {
              "title": "About Me",
              "description": "I'm a developer..."
            }
          }
        ],
        "seo": {
          "title": "Portfolio SEO Title",
          "description": "Portfolio SEO description",
          "keywords": ["developer", "portfolio"]
        },
        "analytics": {
          "views": 150,
          "uniqueViews": 120
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 10,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Get Portfolio by ID

**GET** `/api/portfolios/:id`

Returns a specific portfolio by ID.

#### Request
```http
GET /api/portfolios/portfolio_id
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "portfolio": {
      // Complete portfolio object
    }
  }
}
```

### Create Portfolio

**POST** `/api/portfolios`

Creates a new portfolio for the authenticated user.

#### Request
```http
POST /api/portfolios
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "title": "My New Portfolio",
  "description": "Portfolio description",
  "theme": "modern",
  "layout": "grid",
  "status": "draft"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "portfolio": {
      "id": "new_portfolio_id",
      "title": "My New Portfolio",
      "slug": "my-new-portfolio",
      // ... other portfolio fields
    }
  },
  "message": "Portfolio created successfully"
}
```

### Update Portfolio

**PUT** `/api/portfolios/:id`

Updates an existing portfolio.

#### Request
```http
PUT /api/portfolios/portfolio_id
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "title": "Updated Portfolio Title",
  "description": "Updated description",
  "status": "published"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "portfolio": {
      // Updated portfolio object
    }
  },
  "message": "Portfolio updated successfully"
}
```

### Delete Portfolio

**DELETE** `/api/portfolios/:id`

Deletes a portfolio permanently.

#### Request
```http
DELETE /api/portfolios/portfolio_id
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "message": "Portfolio deleted successfully"
}
```

---

## Block Management

### Get Portfolio Blocks

**GET** `/api/portfolios/:portfolioId/blocks`

Returns all blocks for a specific portfolio.

#### Request
```http
GET /api/portfolios/portfolio_id/blocks
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "blocks": [
      {
        "id": "block_id",
        "type": "bio",
        "order": 1,
        "visible": true,
        "content": {
          "title": "About Me",
          "description": "I'm a developer...",
          "image": "https://example.com/avatar.jpg"
        },
        "layout": {
          "width": "full",
          "height": "auto",
          "padding": "medium"
        },
        "styling": {
          "backgroundColor": "#ffffff",
          "textColor": "#333333",
          "borderRadius": "8px"
        }
      }
    ]
  }
}
```

### Create Block

**POST** `/api/portfolios/:portfolioId/blocks`

Creates a new block in a portfolio.

#### Request
```http
POST /api/portfolios/portfolio_id/blocks
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "type": "projects",
  "content": {
    "title": "My Projects",
    "projects": [
      {
        "name": "Project 1",
        "description": "Project description",
        "url": "https://github.com/user/project1",
        "technologies": ["React", "Node.js"]
      }
    ]
  },
  "order": 2
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "block": {
      "id": "new_block_id",
      "type": "projects",
      // ... other block fields
    }
  },
  "message": "Block created successfully"
}
```

### Update Block

**PUT** `/api/blocks/:id`

Updates an existing block.

#### Request
```http
PUT /api/blocks/block_id
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "content": {
    "title": "Updated Block Title",
    "description": "Updated description"
  },
  "visible": false
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "block": {
      // Updated block object
    }
  },
  "message": "Block updated successfully"
}
```

### Delete Block

**DELETE** `/api/blocks/:id`

Deletes a block from a portfolio.

#### Request
```http
DELETE /api/blocks/block_id
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "message": "Block deleted successfully"
}
```

---

## GitHub Integration

### Get User Repositories

**GET** `/api/github/repos`

Returns the user's GitHub repositories.

#### Request
```http
GET /api/github/repos
Authorization: Bearer your_jwt_token
```

#### Query Parameters
- `type` (optional): Repository type (`all`, `owner`, `member`) - default: `owner`
- `sort` (optional): Sort by (`created`, `updated`, `pushed`, `full_name`) - default: `updated`
- `direction` (optional): Sort direction (`asc`, `desc`) - default: `desc`
- `per_page` (optional): Results per page (max: 100) - default: 30

#### Response
```json
{
  "success": true,
  "data": {
    "repositories": [
      {
        "id": 123456789,
        "name": "my-project",
        "full_name": "username/my-project",
        "description": "Project description",
        "html_url": "https://github.com/username/my-project",
        "language": "JavaScript",
        "stargazers_count": 25,
        "forks_count": 5,
        "topics": ["react", "nodejs"],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "pushed_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Get Pinned Repositories

**GET** `/api/github/repos/pinned`

Returns the user's pinned GitHub repositories.

#### Request
```http
GET /api/github/repos/pinned
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "pinnedRepositories": [
      {
        // Repository object (same structure as above)
      }
    ]
  }
}
```

### Get GitHub User Data

**GET** `/api/github/user`

Returns the user's GitHub profile data.

#### Request
```http
GET /api/github/user
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "githubUser": {
      "login": "username",
      "id": 12345678,
      "avatar_url": "https://avatars.githubusercontent.com/...",
      "html_url": "https://github.com/username",
      "name": "User Name",
      "company": "Company Name",
      "blog": "https://user-website.com",
      "location": "City, Country",
      "email": "user@example.com",
      "bio": "User bio",
      "public_repos": 25,
      "followers": 100,
      "following": 50,
      "created_at": "2020-01-01T00:00:00Z"
    }
  }
}
```

---

## AI Features

### Get AI Suggestions

**POST** `/api/ai/suggestions`

Generates AI-powered content suggestions for portfolio improvement.

#### Request
```http
POST /api/ai/suggestions
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "type": "bio",
  "context": {
    "githubData": {
      "repositories": [...],
      "profile": {...}
    },
    "currentContent": "Current bio text"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "bio",
        "content": "Suggested bio content based on GitHub activity...",
        "confidence": 0.85,
        "reasoning": "Based on your JavaScript projects and contributions..."
      }
    ],
    "usage": {
      "remaining": 4,
      "limit": 5,
      "resetDate": "2024-02-01T00:00:00.000Z"
    }
  }
}
```

### Get Portfolio Optimization

**POST** `/api/ai/optimize`

Analyzes a portfolio and provides optimization suggestions.

#### Request
```http
POST /api/ai/optimize
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "portfolioId": "portfolio_id"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "analysis": {
      "score": 78,
      "strengths": [
        "Strong project showcase",
        "Clear contact information"
      ],
      "improvements": [
        {
          "category": "content",
          "suggestion": "Add more detailed project descriptions",
          "priority": "high",
          "impact": "Increases visitor engagement by 25%"
        }
      ]
    }
  }
}
```

### Generate SEO Metadata

**POST** `/api/ai/seo`

Generates SEO-optimized metadata for a portfolio.

#### Request
```http
POST /api/ai/seo
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "portfolioId": "portfolio_id"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "seo": {
      "title": "John Doe - Full Stack Developer Portfolio",
      "description": "Experienced full stack developer specializing in React, Node.js, and cloud technologies. View my projects and get in touch.",
      "keywords": ["full stack developer", "react", "nodejs", "portfolio"],
      "ogTitle": "John Doe - Full Stack Developer",
      "ogDescription": "Check out my latest projects and development work",
      "twitterTitle": "John Doe's Developer Portfolio",
      "twitterDescription": "Full stack developer with expertise in modern web technologies"
    }
  }
}
```

### Get AI Usage Statistics

**GET** `/api/ai/usage`

Returns the user's AI feature usage statistics.

#### Request
```http
GET /api/ai/usage
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "usage": {
      "current": {
        "suggestions": 3,
        "optimizations": 1,
        "seoGenerations": 2
      },
      "limits": {
        "suggestions": 5,
        "optimizations": 2,
        "seoGenerations": 3
      },
      "resetDate": "2024-02-01T00:00:00.000Z",
      "plan": "free"
    }
  }
}
```

---

## Export Features

### Export as JSON

**GET** `/api/export/json/:portfolioId`

Exports a portfolio as structured JSON data.

#### Request
```http
GET /api/export/json/portfolio_id
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "portfolio": {
      // Complete portfolio data structure
    },
    "exportedAt": "2024-01-15T10:30:00.000Z",
    "format": "json",
    "version": "1.0"
  }
}
```

### Export as Markdown

**GET** `/api/export/markdown/:portfolioId`

Exports a portfolio as Markdown format.

#### Request
```http
GET /api/export/markdown/portfolio_id
Authorization: Bearer your_jwt_token
```

#### Response
```
Content-Type: text/markdown
Content-Disposition: attachment; filename="portfolio.md"

# John Doe - Full Stack Developer

## About Me
I'm a passionate full stack developer...

## Projects
### Project 1
Description of project 1...
```

### Export as PDF

**GET** `/api/export/pdf/:portfolioId`

Exports a portfolio as PDF document.

#### Request
```http
GET /api/export/pdf/portfolio_id
Authorization: Bearer your_jwt_token
```

#### Query Parameters
- `format` (optional): PDF format (`a4`, `letter`) - default: `a4`
- `orientation` (optional): Page orientation (`portrait`, `landscape`) - default: `portrait`

#### Response
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="portfolio.pdf"

[PDF binary data]
```

---

## Premium Features

### Get Subscription Plans

**GET** `/api/premium/plans`

Returns available subscription plans.

#### Request
```http
GET /api/premium/plans
```

#### Response
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "free",
        "name": "Free",
        "price": 0,
        "interval": "month",
        "features": [
          "Basic portfolio builder",
          "GitHub integration",
          "5 AI suggestions/month"
        ]
      },
      {
        "id": "pro",
        "name": "Pro",
        "price": 999,
        "interval": "month",
        "features": [
          "Everything in Free",
          "Unlimited portfolios",
          "Custom domains",
          "100 AI suggestions/month",
          "Premium themes",
          "Export features"
        ]
      }
    ]
  }
}
```

### Get User Subscription

**GET** `/api/premium/subscription`

Returns the user's current subscription information.

#### Request
```http
GET /api/premium/subscription
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_123456789",
      "plan": "pro",
      "status": "active",
      "currentPeriodStart": "2024-01-01T00:00:00.000Z",
      "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
      "cancelAtPeriodEnd": false,
      "features": {
        "aiSuggestions": 100,
        "customDomains": true,
        "premiumThemes": true,
        "exportFeatures": true
      }
    }
  }
}
```

### Create Checkout Session

**POST** `/api/premium/checkout`

Creates a Stripe checkout session for subscription upgrade.

#### Request
```http
POST /api/premium/checkout
Content-Type: application/json
Authorization: Bearer your_jwt_token

{
  "planId": "pro",
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_...",
    "sessionId": "cs_123456789"
  }
}
```

### Cancel Subscription

**POST** `/api/premium/cancel`

Cancels the user's subscription at the end of the current period.

#### Request
```http
POST /api/premium/cancel
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_123456789",
      "status": "active",
      "cancelAtPeriodEnd": true,
      "currentPeriodEnd": "2024-02-01T00:00:00.000Z"
    }
  },
  "message": "Subscription will be canceled at the end of the current period"
}
```

---

## Analytics

### Get Basic Analytics

**GET** `/api/analytics/:portfolioId`

Returns basic analytics for a portfolio (available to all users).

#### Request
```http
GET /api/analytics/portfolio_id
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "analytics": {
      "views": {
        "total": 1250,
        "unique": 980,
        "today": 15,
        "thisWeek": 85,
        "thisMonth": 320
      },
      "lastViewed": "2024-01-15T10:30:00.000Z",
      "topReferrers": [
        {
          "source": "github.com",
          "visits": 45
        },
        {
          "source": "linkedin.com",
          "visits": 32
        }
      ]
    }
  }
}
```

### Get Advanced Analytics (Premium)

**GET** `/api/premium/analytics/advanced/:portfolioId`

Returns detailed analytics for premium users.

#### Request
```http
GET /api/premium/analytics/advanced/portfolio_id
Authorization: Bearer your_jwt_token
```

#### Response
```json
{
  "success": true,
  "data": {
    "analytics": {
      "views": {
        "daily": [
          {"date": "2024-01-01", "views": 25, "unique": 20},
          {"date": "2024-01-02", "views": 30, "unique": 25}
        ],
        "hourly": [...],
        "total": 1250,
        "unique": 980
      },
      "demographics": {
        "countries": [
          {"country": "United States", "visits": 450},
          {"country": "United Kingdom", "visits": 200}
        ],
        "devices": {
          "desktop": 60,
          "mobile": 35,
          "tablet": 5
        },
        "browsers": {
          "chrome": 65,
          "firefox": 20,
          "safari": 15
        }
      },
      "engagement": {
        "averageTimeOnPage": 120,
        "bounceRate": 0.25,
        "pagesPerSession": 2.3
      }
    }
  }
}
```

---

## System Health

### Health Check

**GET** `/health`

Returns the system health status.

#### Request
```http
GET /health
```

#### Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 86400,
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "connected",
      "responseTime": 15
    },
    "redis": {
      "status": "connected",
      "responseTime": 5
    },
    "github": {
      "status": "available",
      "responseTime": 120
    }
  },
  "memory": {
    "used": 256,
    "total": 512,
    "percentage": 50
  }
}
```

---

## Error Codes

### Authentication Errors
- `AUTH_TOKEN_MISSING` - No authentication token provided
- `AUTH_TOKEN_INVALID` - Invalid or expired token
- `AUTH_TOKEN_EXPIRED` - Token has expired
- `AUTH_USER_NOT_FOUND` - User not found in database
- `AUTH_GITHUB_ERROR` - GitHub OAuth error

### Validation Errors
- `VALIDATION_ERROR` - Request validation failed
- `INVALID_PORTFOLIO_ID` - Portfolio ID is invalid
- `INVALID_BLOCK_TYPE` - Block type is not supported
- `MISSING_REQUIRED_FIELD` - Required field is missing

### Permission Errors
- `PERMISSION_DENIED` - User doesn't have permission
- `RESOURCE_NOT_OWNED` - User doesn't own the resource
- `SUBSCRIPTION_REQUIRED` - Premium subscription required

### Rate Limiting Errors
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `AI_LIMIT_EXCEEDED` - AI usage limit exceeded

### System Errors
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_SERVICE_ERROR` - External service unavailable
- `INTERNAL_SERVER_ERROR` - Unexpected server error

---

## SDKs and Libraries

### JavaScript/TypeScript

```typescript
// Example usage with fetch
const response = await fetch('/api/portfolios', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### cURL Examples

```bash
# Get user profile
curl -X GET \
  https://devdeck-api.railway.app/api/user/profile \
  -H 'Authorization: Bearer your_jwt_token'

# Create portfolio
curl -X POST \
  https://devdeck-api.railway.app/api/portfolios \
  -H 'Authorization: Bearer your_jwt_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "My Portfolio",
    "description": "Portfolio description"
  }'
```

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Authentication with GitHub OAuth
- Portfolio and block management
- AI-powered suggestions
- Export functionality
- Premium subscription features
- Analytics and monitoring

---

## Support

For API support and questions:
- **Email**: api-support@devdeck.com
- **Documentation**: https://devdeck.vercel.app/docs
- **GitHub Issues**: https://github.com/devdeck/devdeck/issues

---

*Last updated: January 15, 2024*
*API Version: 1.0.0*