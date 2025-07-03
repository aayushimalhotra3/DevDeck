# DevDeck Testing Guide

Comprehensive testing documentation for the DevDeck application, covering unit tests, integration tests, API testing, and end-to-end testing strategies.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Stack](#testing-stack)
3. [Test Structure](#test-structure)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [API Testing](#api-testing)
7. [End-to-End Testing](#end-to-end-testing)
8. [Performance Testing](#performance-testing)
9. [Security Testing](#security-testing)
10. [Test Data Management](#test-data-management)
11. [Continuous Integration](#continuous-integration)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

---

## Testing Philosophy

DevDeck follows a comprehensive testing strategy based on the testing pyramid:

```
    /\     E2E Tests (Few)
   /  \    
  /____\   Integration Tests (Some)
 /______\  Unit Tests (Many)
```

### Testing Principles

- **Fast Feedback**: Tests should run quickly to provide immediate feedback
- **Reliable**: Tests should be deterministic and not flaky
- **Maintainable**: Tests should be easy to understand and modify
- **Comprehensive**: Critical paths and edge cases should be covered
- **Isolated**: Tests should not depend on external services when possible

---

## Testing Stack

### Backend Testing
- **Test Framework**: Jest
- **Assertion Library**: Jest built-in assertions
- **Mocking**: Jest mocks + Sinon.js
- **Test Database**: MongoDB Memory Server
- **API Testing**: Supertest
- **Coverage**: Jest coverage reports

### Frontend Testing
- **Test Framework**: Jest + React Testing Library
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **Visual Testing**: Chromatic (Storybook)
- **Mocking**: MSW (Mock Service Worker)

### Tools
- **Test Runner**: Jest
- **CI/CD**: GitHub Actions
- **Coverage Reporting**: Codecov
- **Performance Testing**: Artillery
- **Security Testing**: OWASP ZAP

---

## Test Structure

### Directory Structure

```
backend/
├── src/
│   ├── __tests__/           # Unit tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── models/
│   │   └── __tests__/       # Model tests
│   ├── routes/
│   │   └── __tests__/       # Route tests
│   └── utils/
│       └── __tests__/       # Utility tests
├── tests/
│   ├── e2e/                 # End-to-end tests
│   ├── performance/         # Performance tests
│   └── security/            # Security tests
└── jest.config.js

frontend/
├── src/
│   ├── components/
│   │   └── __tests__/       # Component tests
│   ├── pages/
│   │   └── __tests__/       # Page tests
│   ├── hooks/
│   │   └── __tests__/       # Hook tests
│   └── utils/
│       └── __tests__/       # Utility tests
├── tests/
│   ├── e2e/                 # Playwright tests
│   └── setup/               # Test setup files
└── jest.config.js
```

### Naming Conventions

- **Test Files**: `*.test.js` or `*.spec.js`
- **Test Suites**: Descriptive names matching the module being tested
- **Test Cases**: Use `describe` and `it` with clear, descriptive names

```javascript
// Good
describe('AuthMiddleware', () => {
  describe('authenticateUser', () => {
    it('should authenticate user with valid token', () => {
      // test implementation
    });
    
    it('should reject authentication with invalid token', () => {
      // test implementation
    });
  });
});
```

---

## Unit Testing

### Backend Unit Tests

#### Testing Models

```javascript
// backend/src/models/__tests__/User.test.js
const User = require('../User');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

describe('User Model', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        githubId: '123456'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.createdAt).toBeDefined();
    });

    it('should not create user with duplicate email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        githubId: '123456'
      };

      await User.create(userData);

      const duplicateUser = new User({
        ...userData,
        username: 'testuser2',
        githubId: '789012'
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    it('should generate auth token', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        githubId: '123456'
      });

      const token = user.generateAuthToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should validate password correctly', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        githubId: '123456'
      });

      const password = 'testpassword123';
      user.password = password;
      await user.save();

      const isValid = await user.validatePassword(password);
      expect(isValid).toBe(true);

      const isInvalid = await user.validatePassword('wrongpassword');
      expect(isInvalid).toBe(false);
    });
  });
});
```

#### Testing Utilities

```javascript
// backend/src/utils/__tests__/validation.test.js
const {
  validateEmail,
  validatePortfolioData,
  sanitizeInput
} = require('../validation');

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com'
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePortfolioData', () => {
    it('should validate complete portfolio data', () => {
      const validData = {
        title: 'My Portfolio',
        description: 'A great portfolio',
        theme: 'modern',
        layout: 'grid'
      };

      const result = validatePortfolioData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject portfolio data with missing required fields', () => {
      const invalidData = {
        description: 'A portfolio without title'
      };

      const result = validatePortfolioData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous HTML tags', () => {
      const dangerousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(dangerousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello World');
    });

    it('should preserve safe HTML tags', () => {
      const safeInput = '<p>Hello <strong>World</strong></p>';
      const sanitized = sanitizeInput(safeInput);
      
      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<strong>');
    });
  });
});
```

### Frontend Unit Tests

#### Testing Components

```javascript
// frontend/src/components/__tests__/PortfolioCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PortfolioCard } from '../PortfolioCard';
import { mockPortfolio } from '../../tests/fixtures/portfolio';

describe('PortfolioCard', () => {
  const defaultProps = {
    portfolio: mockPortfolio,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onView: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render portfolio information correctly', () => {
    render(<PortfolioCard {...defaultProps} />);
    
    expect(screen.getByText(mockPortfolio.title)).toBeInTheDocument();
    expect(screen.getByText(mockPortfolio.description)).toBeInTheDocument();
    expect(screen.getByText(mockPortfolio.status)).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<PortfolioCard {...defaultProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockPortfolio.id);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<PortfolioCard {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockPortfolio.id);
  });

  it('should show draft badge for draft portfolios', () => {
    const draftPortfolio = { ...mockPortfolio, status: 'draft' };
    render(<PortfolioCard {...defaultProps} portfolio={draftPortfolio} />);
    
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<PortfolioCard {...defaultProps} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining(mockPortfolio.title));
  });
});
```

#### Testing Hooks

```javascript
// frontend/src/hooks/__tests__/usePortfolios.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePortfolios } from '../usePortfolios';
import { mockPortfolios } from '../../tests/fixtures/portfolio';
import * as api from '../../lib/api';

// Mock the API
jest.mock('../../lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('usePortfolios', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch portfolios successfully', async () => {
    mockedApi.getPortfolios.mockResolvedValue({
      success: true,
      data: { portfolios: mockPortfolios }
    });

    const { result } = renderHook(() => usePortfolios(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPortfolios);
    expect(mockedApi.getPortfolios).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch portfolios';
    mockedApi.getPortfolios.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePortfolios(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(expect.objectContaining({
      message: errorMessage
    }));
  });

  it('should show loading state initially', () => {
    mockedApi.getPortfolios.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => usePortfolios(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
```

---

## Integration Testing

### API Integration Tests

```javascript
// backend/src/__tests__/integration/auth.test.js
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { setupTestDB, cleanupTestDB } = require('../setup/database');

describe('Authentication Integration', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/github/callback', () => {
    it('should create new user and return token', async () => {
      const mockGithubResponse = {
        access_token: 'mock_access_token'
      };

      const mockUserData = {
        id: 123456,
        login: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'https://github.com/avatar.jpg'
      };

      // Mock GitHub API calls
      jest.spyOn(require('../../utils/github'), 'exchangeCodeForToken')
        .mockResolvedValue(mockGithubResponse);
      
      jest.spyOn(require('../../utils/github'), 'fetchGithubUser')
        .mockResolvedValue(mockUserData);

      const response = await request(app)
        .post('/api/auth/github/callback')
        .send({ code: 'mock_auth_code' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(mockUserData.login);
      expect(response.body.data.token).toBeDefined();

      // Verify user was created in database
      const user = await User.findOne({ githubId: mockUserData.id });
      expect(user).toBeTruthy();
      expect(user.email).toBe(mockUserData.email);
    });

    it('should update existing user and return token', async () => {
      // Create existing user
      const existingUser = await User.create({
        username: 'testuser',
        email: 'old@example.com',
        githubId: '123456',
        name: 'Old Name'
      });

      const mockGithubResponse = {
        access_token: 'mock_access_token'
      };

      const mockUserData = {
        id: 123456,
        login: 'testuser',
        email: 'new@example.com',
        name: 'New Name',
        avatar_url: 'https://github.com/avatar.jpg'
      };

      jest.spyOn(require('../../utils/github'), 'exchangeCodeForToken')
        .mockResolvedValue(mockGithubResponse);
      
      jest.spyOn(require('../../utils/github'), 'fetchGithubUser')
        .mockResolvedValue(mockUserData);

      const response = await request(app)
        .post('/api/auth/github/callback')
        .send({ code: 'mock_auth_code' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(mockUserData.email);
      expect(response.body.data.user.name).toBe(mockUserData.name);

      // Verify user was updated in database
      const updatedUser = await User.findById(existingUser._id);
      expect(updatedUser.email).toBe(mockUserData.email);
      expect(updatedUser.name).toBe(mockUserData.name);
    });

    it('should handle GitHub API errors', async () => {
      jest.spyOn(require('../../utils/github'), 'exchangeCodeForToken')
        .mockRejectedValue(new Error('GitHub API Error'));

      const response = await request(app)
        .post('/api/auth/github/callback')
        .send({ code: 'invalid_code' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Authentication failed');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        githubId: '123456'
      });

      const token = user.generateAuthToken();

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(user._id.toString());
      expect(response.body.data.user.username).toBe(user.username);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });
  });
});
```

### Database Integration Tests

```javascript
// backend/src/__tests__/integration/portfolio.test.js
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Portfolio = require('../../models/Portfolio');
const { setupTestDB, cleanupTestDB } = require('../setup/database');

describe('Portfolio Integration', () => {
  let user;
  let authToken;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Portfolio.deleteMany({});

    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      githubId: '123456'
    });

    authToken = user.generateAuthToken();
  });

  describe('Portfolio CRUD Operations', () => {
    it('should create, read, update, and delete portfolio', async () => {
      // Create
      const createResponse = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Portfolio',
          description: 'A test portfolio',
          theme: 'modern'
        })
        .expect(201);

      const portfolioId = createResponse.body.data.portfolio.id;
      expect(createResponse.body.data.portfolio.title).toBe('Test Portfolio');

      // Read
      const readResponse = await request(app)
        .get(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(readResponse.body.data.portfolio.title).toBe('Test Portfolio');

      // Update
      const updateResponse = await request(app)
        .put(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Portfolio',
          status: 'published'
        })
        .expect(200);

      expect(updateResponse.body.data.portfolio.title).toBe('Updated Portfolio');
      expect(updateResponse.body.data.portfolio.status).toBe('published');

      // Delete
      await request(app)
        .delete(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should enforce ownership restrictions', async () => {
      // Create portfolio with first user
      const portfolio = await Portfolio.create({
        title: 'User 1 Portfolio',
        description: 'Portfolio by user 1',
        userId: user._id
      });

      // Create second user
      const user2 = await User.create({
        username: 'testuser2',
        email: 'test2@example.com',
        githubId: '789012'
      });

      const user2Token = user2.generateAuthToken();

      // Try to access first user's portfolio with second user's token
      await request(app)
        .get(`/api/portfolios/${portfolio._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      // Try to update first user's portfolio with second user's token
      await request(app)
        .put(`/api/portfolios/${portfolio._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hacked Portfolio' })
        .expect(403);

      // Try to delete first user's portfolio with second user's token
      await request(app)
        .delete(`/api/portfolios/${portfolio._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);
    });
  });
});
```

---

## API Testing

### Automated API Testing with Newman

```json
// tests/api/devdeck-api.postman_collection.json
{
  "info": {
    "name": "DevDeck API Tests",
    "description": "Comprehensive API test suite for DevDeck",
    "version": "1.0.0"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "{{$randomUUID}}",
      "type": "string"
    },
    {
      "key": "authToken",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "GitHub OAuth Initiation",
          "request": {
            "method": "POST",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/auth/github",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "github"]
            }
          },
          "response": []
        }
      ]
    }
  ]
}
```

### API Test Scripts

```bash
#!/bin/bash
# tests/api/run-api-tests.sh

set -e

echo "Starting API tests..."

# Set environment variables
export API_BASE_URL="http://localhost:5001"
export TEST_USER_EMAIL="test@example.com"
export TEST_USER_PASSWORD="testpassword123"

# Start test database
echo "Starting test database..."
docker-compose -f docker-compose.test.yml up -d mongodb

# Wait for database to be ready
echo "Waiting for database..."
sleep 10

# Start API server in test mode
echo "Starting API server..."
NODE_ENV=test npm run start:test &
API_PID=$!

# Wait for API server to be ready
echo "Waiting for API server..."
sleep 5

# Run Postman collection tests
echo "Running Postman collection tests..."
newman run tests/api/devdeck-api.postman_collection.json \
  --environment tests/api/test.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export tests/api/results.json

# Run custom API tests
echo "Running custom API tests..."
node tests/api/custom-tests.js

# Cleanup
echo "Cleaning up..."
kill $API_PID
docker-compose -f docker-compose.test.yml down

echo "API tests completed!"
```

---

## End-to-End Testing

### Playwright E2E Tests

```javascript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Authentication Flow', () => {
  test('should complete GitHub OAuth flow', async ({ page, context }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Navigate to login page
    await loginPage.goto();
    await expect(page).toHaveTitle(/DevDeck/);

    // Click GitHub login button
    await loginPage.clickGithubLogin();

    // Handle GitHub OAuth (mock in test environment)
    await page.route('**/api/auth/github/callback', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'test-user-id',
              username: 'testuser',
              email: 'test@example.com',
              name: 'Test User'
            },
            token: 'mock-jwt-token'
          }
        })
      });
    });

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(dashboardPage.welcomeMessage).toBeVisible();
    await expect(dashboardPage.welcomeMessage).toContainText('Welcome, Test User');
  });

  test('should handle authentication errors', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // Mock authentication error
    await page.route('**/api/auth/github/callback', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Authentication failed'
        })
      });
    });

    await loginPage.clickGithubLogin();

    // Verify error message is displayed
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Authentication failed');
  });

  test('should logout successfully', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    // Login first (using test helper)
    await dashboardPage.loginAsTestUser();
    await expect(page).toHaveURL(/\/dashboard/);

    // Logout
    await dashboardPage.logout();

    // Verify redirect to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.githubLoginButton).toBeVisible();
  });
});
```

```javascript
// tests/e2e/portfolio.spec.ts
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { PortfolioEditorPage } from '../pages/PortfolioEditorPage';

test.describe('Portfolio Management', () => {
  test.beforeEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.loginAsTestUser();
  });

  test('should create a new portfolio', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const editorPage = new PortfolioEditorPage(page);

    // Navigate to create portfolio
    await dashboardPage.clickCreatePortfolio();
    await expect(page).toHaveURL(/\/portfolio\/create/);

    // Fill portfolio details
    await editorPage.fillTitle('My Test Portfolio');
    await editorPage.fillDescription('A portfolio created during testing');
    await editorPage.selectTheme('modern');

    // Add bio block
    await editorPage.addBlock('bio');
    await editorPage.fillBioContent({
      title: 'About Me',
      description: 'I am a test user creating a portfolio'
    });

    // Save portfolio
    await editorPage.savePortfolio();

    // Verify success message
    await expect(editorPage.successMessage).toBeVisible();
    await expect(editorPage.successMessage).toContainText('Portfolio saved successfully');

    // Verify portfolio appears in dashboard
    await dashboardPage.goto();
    await expect(dashboardPage.getPortfolioCard('My Test Portfolio')).toBeVisible();
  });

  test('should edit existing portfolio', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const editorPage = new PortfolioEditorPage(page);

    // Create a portfolio first (using API helper)
    await dashboardPage.createTestPortfolio({
      title: 'Portfolio to Edit',
      description: 'Original description'
    });

    await dashboardPage.goto();

    // Edit portfolio
    await dashboardPage.editPortfolio('Portfolio to Edit');
    await expect(page).toHaveURL(/\/portfolio\/.*\/edit/);

    // Update details
    await editorPage.fillTitle('Updated Portfolio Title');
    await editorPage.fillDescription('Updated description');

    // Save changes
    await editorPage.savePortfolio();

    // Verify changes
    await dashboardPage.goto();
    await expect(dashboardPage.getPortfolioCard('Updated Portfolio Title')).toBeVisible();
  });

  test('should delete portfolio', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // Create a portfolio first
    await dashboardPage.createTestPortfolio({
      title: 'Portfolio to Delete',
      description: 'This will be deleted'
    });

    await dashboardPage.goto();

    // Delete portfolio
    await dashboardPage.deletePortfolio('Portfolio to Delete');

    // Confirm deletion in modal
    await expect(dashboardPage.deleteConfirmModal).toBeVisible();
    await dashboardPage.confirmDelete();

    // Verify portfolio is removed
    await expect(dashboardPage.getPortfolioCard('Portfolio to Delete')).not.toBeVisible();
  });

  test('should preview portfolio', async ({ page, context }) => {
    const dashboardPage = new DashboardPage(page);

    // Create a portfolio first
    await dashboardPage.createTestPortfolio({
      title: 'Portfolio to Preview',
      description: 'Preview test portfolio'
    });

    await dashboardPage.goto();

    // Preview portfolio (opens in new tab)
    const [previewPage] = await Promise.all([
      context.waitForEvent('page'),
      dashboardPage.previewPortfolio('Portfolio to Preview')
    ]);

    // Verify preview page
    await expect(previewPage).toHaveTitle(/Portfolio to Preview/);
    await expect(previewPage.locator('h1')).toContainText('Portfolio to Preview');
    await expect(previewPage.locator('.portfolio-description')).toContainText('Preview test portfolio');
  });
});
```

### Page Object Models

```javascript
// tests/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly githubLoginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.githubLoginButton = page.locator('[data-testid="github-login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async clickGithubLogin() {
    await this.githubLoginButton.click();
  }
}
```

```javascript
// tests/pages/DashboardPage.ts
import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly createPortfolioButton: Locator;
  readonly deleteConfirmModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.createPortfolioButton = page.locator('[data-testid="create-portfolio-button"]');
    this.deleteConfirmModal = page.locator('[data-testid="delete-confirm-modal"]');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async clickCreatePortfolio() {
    await this.createPortfolioButton.click();
  }

  async loginAsTestUser() {
    // Mock authentication for testing
    await this.page.addInitScript(() => {
      localStorage.setItem('auth-token', 'mock-test-token');
    });
    
    await this.page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'test-user-id',
              username: 'testuser',
              email: 'test@example.com',
              name: 'Test User'
            }
          }
        })
      });
    });

    await this.goto();
  }

  getPortfolioCard(title: string): Locator {
    return this.page.locator(`[data-testid="portfolio-card"]`).filter({ hasText: title });
  }

  async editPortfolio(title: string) {
    const card = this.getPortfolioCard(title);
    await card.locator('[data-testid="edit-button"]').click();
  }

  async deletePortfolio(title: string) {
    const card = this.getPortfolioCard(title);
    await card.locator('[data-testid="delete-button"]').click();
  }

  async confirmDelete() {
    await this.deleteConfirmModal.locator('[data-testid="confirm-delete-button"]').click();
  }

  async previewPortfolio(title: string) {
    const card = this.getPortfolioCard(title);
    await card.locator('[data-testid="preview-button"]').click();
  }

  async logout() {
    await this.page.locator('[data-testid="user-menu"]').click();
    await this.page.locator('[data-testid="logout-button"]').click();
  }

  async createTestPortfolio(data: { title: string; description: string }) {
    // Helper method to create portfolio via API for testing
    await this.page.evaluate(async (portfolioData) => {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(portfolioData)
      });
      return response.json();
    }, data);
  }
}
```

---

## Performance Testing

### Load Testing with Artillery

```yaml
# tests/performance/load-test.yml
config:
  target: 'http://localhost:5001'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 20
      name: "Sustained load"
  payload:
    path: "./test-data.csv"
    fields:
      - "username"
      - "email"
  variables:
    authToken: "mock-jwt-token"

scenarios:
  - name: "Portfolio CRUD Operations"
    weight: 70
    flow:
      - post:
          url: "/api/auth/github/callback"
          json:
            code: "mock-auth-code"
          capture:
            - json: "$.data.token"
              as: "authToken"
      - get:
          url: "/api/portfolios"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - post:
          url: "/api/portfolios"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            title: "Load Test Portfolio {{ $randomString() }}"
            description: "Created during load testing"
          capture:
            - json: "$.data.portfolio.id"
              as: "portfolioId"
      - get:
          url: "/api/portfolios/{{ portfolioId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - put:
          url: "/api/portfolios/{{ portfolioId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            title: "Updated Load Test Portfolio"
            status: "published"
      - delete:
          url: "/api/portfolios/{{ portfolioId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "GitHub Integration"
    weight: 20
    flow:
      - get:
          url: "/api/github/repos"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - get:
          url: "/api/github/user"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "AI Features"
    weight: 10
    flow:
      - post:
          url: "/api/ai/suggestions"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            type: "bio"
            context:
              currentContent: "I am a developer"
```

### Performance Test Scripts

```javascript
// tests/performance/benchmark.js
const autocannon = require('autocannon');
const { performance } = require('perf_hooks');

async function runBenchmark() {
  console.log('Starting performance benchmark...');

  const tests = [
    {
      name: 'Health Check',
      url: 'http://localhost:5001/health',
      connections: 10,
      duration: 30
    },
    {
      name: 'Portfolio List (Authenticated)',
      url: 'http://localhost:5001/api/portfolios',
      connections: 20,
      duration: 60,
      headers: {
        'Authorization': 'Bearer mock-jwt-token'
      }
    },
    {
      name: 'GitHub Repos (Authenticated)',
      url: 'http://localhost:5001/api/github/repos',
      connections: 15,
      duration: 45,
      headers: {
        'Authorization': 'Bearer mock-jwt-token'
      }
    }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\nRunning ${test.name}...`);
    
    const startTime = performance.now();
    
    const result = await autocannon({
      url: test.url,
      connections: test.connections,
      duration: test.duration,
      headers: test.headers || {},
      requests: [
        {
          method: 'GET'
        }
      ]
    });

    const endTime = performance.now();
    
    results.push({
      name: test.name,
      duration: endTime - startTime,
      requests: result.requests,
      latency: result.latency,
      throughput: result.throughput,
      errors: result.errors
    });

    console.log(`Completed ${test.name}:`);
    console.log(`  Requests: ${result.requests.total}`);
    console.log(`  Avg Latency: ${result.latency.average}ms`);
    console.log(`  Throughput: ${result.throughput.average} req/sec`);
    console.log(`  Errors: ${result.errors}`);
  }

  // Generate report
  console.log('\n=== Performance Benchmark Report ===');
  results.forEach(result => {
    console.log(`\n${result.name}:`);
    console.log(`  Total Requests: ${result.requests.total}`);
    console.log(`  Average Latency: ${result.latency.average}ms`);
    console.log(`  95th Percentile: ${result.latency.p95}ms`);
    console.log(`  99th Percentile: ${result.latency.p99}ms`);
    console.log(`  Throughput: ${result.throughput.average} req/sec`);
    console.log(`  Error Rate: ${(result.errors / result.requests.total * 100).toFixed(2)}%`);
  });

  // Performance thresholds
  const thresholds = {
    averageLatency: 200, // ms
    p95Latency: 500, // ms
    errorRate: 1 // %
  };

  let passed = true;
  results.forEach(result => {
    const errorRate = (result.errors / result.requests.total) * 100;
    
    if (result.latency.average > thresholds.averageLatency) {
      console.log(`❌ ${result.name}: Average latency too high (${result.latency.average}ms > ${thresholds.averageLatency}ms)`);
      passed = false;
    }
    
    if (result.latency.p95 > thresholds.p95Latency) {
      console.log(`❌ ${result.name}: 95th percentile latency too high (${result.latency.p95}ms > ${thresholds.p95Latency}ms)`);
      passed = false;
    }
    
    if (errorRate > thresholds.errorRate) {
      console.log(`❌ ${result.name}: Error rate too high (${errorRate.toFixed(2)}% > ${thresholds.errorRate}%)`);
      passed = false;
    }
  });

  if (passed) {
    console.log('\n✅ All performance tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some performance tests failed!');
    process.exit(1);
  }
}

if (require.main === module) {
  runBenchmark().catch(console.error);
}

module.exports = { runBenchmark };
```

---

## Security Testing

### OWASP ZAP Integration

```javascript
// tests/security/zap-scan.js
const ZapClient = require('zaproxy');
const fs = require('fs');
const path = require('path');

class SecurityScanner {
  constructor() {
    this.zap = new ZapClient({
      proxy: 'http://localhost:8080'
    });
    this.targetUrl = 'http://localhost:5001';
  }

  async runSecurityScan() {
    console.log('Starting security scan...');

    try {
      // Start ZAP session
      await this.zap.core.newSession();

      // Spider the application
      console.log('Spidering application...');
      const spiderScanId = await this.zap.spider.scan(this.targetUrl);
      await this.waitForScanCompletion('spider', spiderScanId);

      // Run active scan
      console.log('Running active security scan...');
      const activeScanId = await this.zap.ascan.scan(this.targetUrl);
      await this.waitForScanCompletion('ascan', activeScanId);

      // Get results
      const alerts = await this.zap.core.alerts();
      
      // Generate report
      await this.generateReport(alerts);
      
      // Check for critical vulnerabilities
      const criticalIssues = alerts.filter(alert => 
        alert.risk === 'High' || alert.risk === 'Critical'
      );

      if (criticalIssues.length > 0) {
        console.log(`❌ Found ${criticalIssues.length} critical security issues!`);
        criticalIssues.forEach(issue => {
          console.log(`  - ${issue.alert}: ${issue.desc}`);
        });
        process.exit(1);
      } else {
        console.log('✅ No critical security issues found!');
      }

    } catch (error) {
      console.error('Security scan failed:', error);
      process.exit(1);
    }
  }

  async waitForScanCompletion(scanType, scanId) {
    let progress = 0;
    while (progress < 100) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (scanType === 'spider') {
        progress = await this.zap.spider.status(scanId);
      } else if (scanType === 'ascan') {
        progress = await this.zap.ascan.status(scanId);
      }
      
      console.log(`${scanType} progress: ${progress}%`);
    }
  }

  async generateReport(alerts) {
    const report = {
      timestamp: new Date().toISOString(),
      target: this.targetUrl,
      summary: {
        total: alerts.length,
        high: alerts.filter(a => a.risk === 'High').length,
        medium: alerts.filter(a => a.risk === 'Medium').length,
        low: alerts.filter(a => a.risk === 'Low').length,
        informational: alerts.filter(a => a.risk === 'Informational').length
      },
      alerts: alerts
    };

    const reportPath = path.join(__dirname, 'security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`Security report saved to: ${reportPath}`);
    console.log(`Summary: ${report.summary.high} High, ${report.summary.medium} Medium, ${report.summary.low} Low`);
  }
}

if (require.main === module) {
  const scanner = new SecurityScanner();
  scanner.runSecurityScan().catch(console.error);
}

module.exports = SecurityScanner;
```

### Manual Security Tests

```javascript
// tests/security/manual-security.test.js
const request = require('supertest');
const app = require('../../backend/src/app');
const { setupTestDB, cleanupTestDB } = require('../setup/database');

describe('Security Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  describe('Authentication Security', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/portfolios')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    it('should reject requests with invalid tokens', async () => {
      const response = await request(app)
        .get('/api/portfolios')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    it('should reject expired tokens', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: 'test-user-id' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token expired');
    });
  });

  describe('Input Validation Security', () => {
    it('should sanitize XSS attempts in portfolio creation', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        githubId: '123456'
      });

      const token = user.generateAuthToken();
      const xssPayload = '<script>alert("xss")</script>Malicious Title';

      const response = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: xssPayload,
          description: 'Test description'
        })
        .expect(201);

      // Verify XSS payload was sanitized
      expect(response.body.data.portfolio.title).not.toContain('<script>');
      expect(response.body.data.portfolio.title).toContain('Malicious Title');
    });

    it('should prevent SQL injection attempts', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        githubId: '123456'
      });

      const token = user.generateAuthToken();
      const sqlInjectionPayload = "'; DROP TABLE portfolios; --";

      const response = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: sqlInjectionPayload,
          description: 'Test description'
        })
        .expect(201);

      // Verify the payload was treated as regular text
      expect(response.body.data.portfolio.title).toBe(sqlInjectionPayload);
      
      // Verify database is still intact
      const portfolios = await Portfolio.find({});
      expect(portfolios).toBeDefined();
    });

    it('should enforce input length limits', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        githubId: '123456'
      });

      const token = user.generateAuthToken();
      const longTitle = 'A'.repeat(1000); // Assuming max title length is 100

      const response = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: longTitle,
          description: 'Test description'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Title too long');
    });
  });

  describe('Rate Limiting Security', () => {
    it('should enforce rate limits on authentication endpoints', async () => {
      const requests = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/auth/github/callback')
            .send({ code: 'invalid-code' })
        );
      }

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Authorization Security', () => {
    it('should prevent access to other users\' portfolios', async () => {
      // Create two users
      const user1 = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        githubId: '123456'
      });

      const user2 = await User.create({
        username: 'user2',
        email: 'user2@example.com',
        githubId: '789012'
      });

      // Create portfolio for user1
      const portfolio = await Portfolio.create({
        title: 'User 1 Portfolio',
        description: 'Private portfolio',
        userId: user1._id
      });

      const user2Token = user2.generateAuthToken();

      // Try to access user1's portfolio with user2's token
      const response = await request(app)
        .get(`/api/portfolios/${portfolio._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('Data Exposure Security', () => {
    it('should not expose sensitive user data in API responses', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        githubId: '123456',
        githubAccessToken: 'sensitive-token'
      });

      const token = user.generateAuthToken();

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify sensitive data is not exposed
      expect(response.body.data.user.githubAccessToken).toBeUndefined();
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.user._id).toBeUndefined();
      
      // Verify only safe data is exposed
      expect(response.body.data.user.username).toBeDefined();
      expect(response.body.data.user.email).toBeDefined();
    });
  });

  describe('CORS Security', () => {
    it('should enforce CORS policy', async () => {
      const response = await request(app)
        .options('/api/portfolios')
        .set('Origin', 'https://malicious-site.com')
        .expect(200);

      // Verify CORS headers are set appropriately
      expect(response.headers['access-control-allow-origin']).not.toBe('*');
    });
  });
});
```

---

## Test Data Management

### Test Fixtures

```javascript
// tests/fixtures/user.js
module.exports = {
  validUser: {
    username: 'testuser',
    email: 'test@example.com',
    githubId: '123456',
    name: 'Test User',
    avatar: 'https://github.com/avatar.jpg'
  },
  
  adminUser: {
    username: 'adminuser',
    email: 'admin@example.com',
    githubId: '789012',
    name: 'Admin User',
    role: 'admin'
  },
  
  invalidUser: {
    username: '',
    email: 'invalid-email',
    githubId: null
  }
};
```

```javascript
// tests/fixtures/portfolio.js
module.exports = {
  validPortfolio: {
    title: 'Test Portfolio',
    description: 'A portfolio for testing',
    theme: 'modern',
    layout: 'grid',
    status: 'draft',
    blocks: [
      {
        type: 'bio',
        order: 1,
        visible: true,
        content: {
          title: 'About Me',
          description: 'I am a test user'
        }
      }
    ]
  },
  
  publishedPortfolio: {
    title: 'Published Portfolio',
    description: 'A published portfolio',
    theme: 'minimal',
    layout: 'list',
    status: 'published'
  },
  
  mockPortfolios: [
    {
      id: 'portfolio-1',
      title: 'Portfolio 1',
      description: 'First test portfolio',
      status: 'published'
    },
    {
      id: 'portfolio-2',
      title: 'Portfolio 2',
      description: 'Second test portfolio',
      status: 'draft'
    }
  ]
};
```

### Database Setup

```javascript
// tests/setup/database.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  console.log('Test database connected');
};

const cleanupTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('Test database cleaned up');
};

const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

module.exports = {
  setupTestDB,
  cleanupTestDB,
  clearTestDB
};
```

### Test Helpers

```javascript
// tests/helpers/auth.js
const jwt = require('jsonwebtoken');
const User = require('../../backend/src/models/User');

const createTestUser = async (userData = {}) => {
  const defaultData = {
    username: 'testuser',
    email: 'test@example.com',
    githubId: '123456',
    name: 'Test User'
  };
  
  const user = await User.create({ ...defaultData, ...userData });
  return user;
};

const generateTestToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

const createAuthenticatedUser = async (userData = {}) => {
  const user = await createTestUser(userData);
  const token = generateTestToken(user._id);
  
  return { user, token };
};

module.exports = {
  createTestUser,
  generateTestToken,
  createAuthenticatedUser
};
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    services:
      mongodb:
        image: mongo:5.0
        env:
          MONGO_INITDB_ROOT_USERNAME: root
          MONGO_INITDB_ROOT_PASSWORD: password
        ports:
          - 27017:27017
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd frontend && npm ci
        cd ../backend && npm ci
    
    - name: Run linting
      run: |
        npm run lint
        cd frontend && npm run lint
        cd ../backend && npm run lint
    
    - name: Run unit tests
      run: |
        cd backend && npm run test:unit
        cd ../frontend && npm run test:unit
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://root:password@localhost:27017/devdeck_test?authSource=admin
        REDIS_URL: redis://localhost:6379
        JWT_SECRET: test-jwt-secret
    
    - name: Run integration tests
      run: cd backend && npm run test:integration
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://root:password@localhost:27017/devdeck_test?authSource=admin
        REDIS_URL: redis://localhost:6379
        JWT_SECRET: test-jwt-secret
    
    - name: Build applications
      run: |
        cd backend && npm run build
        cd ../frontend && npm run build
    
    - name: Start applications for E2E tests
      run: |
        cd backend && npm start &
        cd frontend && npm start &
        sleep 30
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://root:password@localhost:27017/devdeck_test?authSource=admin
        REDIS_URL: redis://localhost:6379
    
    - name: Run E2E tests
      run: cd frontend && npm run test:e2e
    
    - name: Run security tests
      run: cd backend && npm run test:security
    
    - name: Generate coverage report
      run: |
        cd backend && npm run test:coverage
        cd ../frontend && npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./backend/coverage/lcov.info,./frontend/coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
    
    - name: Performance tests
      run: cd backend && npm run test:performance
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

### Test Scripts in package.json

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:e2e": "playwright test",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:security": "node tests/security/zap-scan.js",
    "test:performance": "node tests/performance/benchmark.js",
    "test:all": "npm run test && npm run test:e2e && npm run test:security"
  }
}
```

---

## Best Practices

### Test Organization

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One Assertion Per Test**: Each test should verify one specific behavior
3. **Descriptive Test Names**: Use clear, descriptive names that explain what is being tested
4. **Test Independence**: Tests should not depend on each other
5. **Clean Up**: Always clean up test data and resources

### Writing Effective Tests

```javascript
// Good test example
describe('Portfolio validation', () => {
  it('should reject portfolio creation with empty title', async () => {
    // Arrange
    const invalidPortfolioData = {
      title: '',
      description: 'Valid description'
    };
    
    // Act
    const result = validatePortfolioData(invalidPortfolioData);
    
    // Assert
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });
});

// Bad test example
describe('Portfolio', () => {
  it('should work', async () => {
    const data = { title: 'Test' };
    const result = validatePortfolioData(data);
    expect(result.isValid).toBe(true);
    
    const portfolio = await Portfolio.create(data);
    expect(portfolio).toBeTruthy();
    
    const found = await Portfolio.findById(portfolio._id);
    expect(found.title).toBe('Test');
  });
});
```

### Mocking Guidelines

1. **Mock External Dependencies**: Always mock external APIs and services
2. **Use Dependency Injection**: Make dependencies injectable for easier testing
3. **Mock at the Right Level**: Mock at the boundary of your system
4. **Verify Mock Interactions**: Ensure mocks are called with correct parameters

### Test Data Management

1. **Use Factories**: Create test data using factory functions
2. **Isolate Test Data**: Each test should use its own data
3. **Clean Up**: Remove test data after each test
4. **Use Realistic Data**: Test data should resemble production data

---

## Troubleshooting

### Common Issues

#### Flaky Tests

**Problem**: Tests that sometimes pass and sometimes fail

**Solutions**:
- Remove dependencies on external services
- Use proper async/await patterns
- Increase timeouts for slow operations
- Clean up test data properly
- Use deterministic test data

#### Memory Leaks in Tests

**Problem**: Tests consuming too much memory or running slowly

**Solutions**:
- Close database connections after tests
- Clear timers and intervals
- Remove event listeners
- Use `beforeEach` and `afterEach` for cleanup

#### Database Connection Issues

**Problem**: Tests failing due to database connection problems

**Solutions**:
- Use MongoDB Memory Server for unit tests
- Ensure proper connection cleanup
- Use connection pooling
- Handle connection errors gracefully

### Debugging Tests

```javascript
// Debug test with console output
describe('Debug example', () => {
  it('should debug test execution', async () => {
    console.log('Test starting...');
    
    const user = await createTestUser();
    console.log('User created:', user.id);
    
    const token = generateTestToken(user._id);
    console.log('Token generated:', token.substring(0, 20) + '...');
    
    // Add breakpoint here for debugging
    debugger;
    
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('Response status:', response.status);
    console.log('Response body:', response.body);
    
    expect(response.status).toBe(200);
  });
});
```

### Performance Optimization

1. **Parallel Test Execution**: Run tests in parallel when possible
2. **Test Grouping**: Group related tests to share setup/teardown
3. **Selective Testing**: Run only affected tests during development
4. **Resource Management**: Properly manage database connections and memory

---

## Test Metrics and Reporting

### Coverage Goals

- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: 80%+ API endpoint coverage
- **E2E Tests**: 100% critical user journey coverage

### Quality Gates

- All tests must pass before merging
- Coverage must not decrease
- No critical security vulnerabilities
- Performance benchmarks must be met

### Reporting

- **Coverage Reports**: Generated automatically in CI/CD
- **Test Results**: Displayed in pull request checks
- **Performance Reports**: Generated for main branch builds
- **Security Reports**: Generated weekly and on releases

---

*Last updated: January 15, 2024*
*Testing Guide Version: 1.0.0*