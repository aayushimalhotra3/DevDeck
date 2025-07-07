# DevDeck API Documentation

Comprehensive API documentation for DevDeck - Developer Portfolio Platform.

## Base URL

- **Production:** `https://your-backend.railway.app`
- **Development:** `http://localhost:5000`

## Authentication

DevDeck uses GitHub OAuth for authentication and JWT tokens for API access.

### Authentication Flow

1. **GitHub OAuth Login**
   ```
   GET /auth/github
   ```

2. **GitHub OAuth Callback**
   ```
   GET /auth/github/callback
   ```

3. **Get Current User**
   ```
   GET /auth/me
   Headers: Authorization: Bearer <jwt_token>
   ```

4. **Logout**
   ```
   POST /auth/logout
   Headers: Authorization: Bearer <jwt_token>
   ```

## API Endpoints

### Health Check

#### GET /health
Returns the health status of the application and its services.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "services": {
    "database": {
      "status": "connected",
      "host": "mongodb://...",
      "name": "devdeck"
    },
    "cache": {
      "status": "connected"
    }
  },
  "version": "1.0.0"
}
```

### User Management

#### GET /api/users/profile
Get current user's profile information.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "githubId": 12345,
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "avatar": "https://github.com/johndoe.png",
    "bio": "Full-stack developer",
    "location": "San Francisco, CA",
    "website": "https://johndoe.dev",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /api/users/profile
Update current user's profile information.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Full-stack developer passionate about React and Node.js",
  "location": "San Francisco, CA",
  "website": "https://johndoe.dev"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated user object
  }
}
```

### Portfolio Management

#### GET /api/portfolio
Get current user's portfolios.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolios": [
      {
        "id": "portfolio_id",
        "title": "My Portfolio",
        "slug": "my-portfolio",
        "description": "A showcase of my work",
        "isPublic": true,
        "theme": "modern",
        "customDomain": null,
        "views": 150,
        "content": {
          "bio": "I'm a passionate developer...",
          "skills": ["React", "Node.js", "MongoDB"],
          "experience": [],
          "education": [],
          "contact": {
            "email": "john@example.com",
            "linkedin": "johndoe",
            "github": "johndoe"
          }
        },
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### POST /api/portfolio
Create a new portfolio.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "My New Portfolio",
  "description": "A showcase of my latest work",
  "isPublic": true,
  "theme": "modern"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Portfolio created successfully",
  "data": {
    // Created portfolio object
  }
}
```

#### GET /api/portfolio/:id
Get a specific portfolio by ID.

**Headers:**
- `Authorization: Bearer <jwt_token>` (for private portfolios)

**Response:**
```json
{
  "success": true,
  "data": {
    // Portfolio object
  }
}
```

#### PUT /api/portfolio/:id
Update a specific portfolio.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "Updated Portfolio Title",
  "description": "Updated description",
  "isPublic": false,
  "content": {
    "bio": "Updated bio...",
    "skills": ["React", "Node.js", "TypeScript"]
  }
}
```

#### DELETE /api/portfolio/:id
Delete a specific portfolio.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Portfolio deleted successfully"
}
```

### Public Portfolio Access

#### GET /api/portfolio/public/:slug
Get a public portfolio by slug.

**Response:**
```json
{
  "success": true,
  "data": {
    // Public portfolio object
  }
}
```

#### GET /api/portfolio/public/user/:username
Get all public portfolios for a user.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "username": "johndoe",
      "name": "John Doe",
      "avatar": "https://github.com/johndoe.png"
    },
    "portfolios": [],
    "pagination": {}
  }
}
```

### Project Management

#### GET /api/projects
Get projects for current user.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `portfolioId` (optional): Filter by portfolio
- `featured` (optional): Filter featured projects
- `status` (optional): Filter by status

#### POST /api/projects
Create a new project.

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "portfolioId": "portfolio_id",
  "title": "My Project",
  "description": "Project description",
  "technologies": ["React", "Node.js"],
  "githubUrl": "https://github.com/user/repo",
  "liveUrl": "https://project.com",
  "featured": true,
  "status": "completed"
}
```

#### PUT /api/projects/:id
Update a project.

#### DELETE /api/projects/:id
Delete a project.

### Analytics

#### GET /api/analytics/portfolio/:id
Get analytics for a portfolio.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics
- `granularity` (optional): day/week/month

**Response:**
```json
{
  "success": true,
  "data": {
    "totalViews": 1500,
    "uniqueVisitors": 800,
    "viewsToday": 25,
    "topReferrers": [
      {"source": "github.com", "count": 300},
      {"source": "linkedin.com", "count": 200}
    ],
    "viewsByDate": [
      {"date": "2024-01-15", "views": 25, "visitors": 20}
    ]
  }
}
```

#### POST /api/analytics/track
Track a portfolio view or interaction.

**Request Body:**
```json
{
  "portfolioId": "portfolio_id",
  "event": "view",
  "source": "direct",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

- **General API:** 100 requests per 15 minutes per IP
- **Authentication:** 5 requests per 15 minutes per IP
- **Analytics tracking:** 1000 requests per hour per IP

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (1-based, default: 1)
- `limit`: Items per page (max: 100, default: 10)
- `sort`: Sort field
- `order`: Sort order (asc/desc)

**Response Format:**
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## WebSocket Events

DevDeck supports real-time updates via WebSocket:

**Connection:** `ws://localhost:5000` or `wss://your-backend.railway.app`

**Events:**
- `portfolio:updated` - Portfolio was updated
- `analytics:view` - New portfolio view
- `project:created` - New project added

## SDKs and Tools

### JavaScript/TypeScript SDK
```javascript
import { DevDeckAPI } from '@devdeck/api-client';

const api = new DevDeckAPI({
  baseURL: 'https://your-backend.railway.app',
  token: 'your-jwt-token'
});

// Get user profile
const profile = await api.users.getProfile();

// Create portfolio
const portfolio = await api.portfolios.create({
  title: 'My Portfolio',
  description: 'A showcase of my work'
});
```

### cURL Examples

**Get Health Status:**
```bash
curl -X GET https://your-backend.railway.app/health
```

**Get User Profile:**
```bash
curl -X GET https://your-backend.railway.app/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create Portfolio:**
```bash
curl -X POST https://your-backend.railway.app/api/portfolio \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Portfolio",
    "description": "A showcase of my work",
    "isPublic": true
  }'
```

## Testing

See the [API Testing Guide](../tests/README.md) for comprehensive testing examples and tools.

## Support

For API support and questions:
- GitHub Issues: [DevDeck Repository](https://github.com/your-org/devdeck)
- Documentation: [Full Documentation](https://docs.devdeck.dev)
