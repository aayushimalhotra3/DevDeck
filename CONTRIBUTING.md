# Contributing to DevDeck 🤝

Thank you for your interest in contributing to DevDeck! We welcome contributions from developers of all skill levels. This document provides guidelines and information for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be collaborative**: Work together to solve problems
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that everyone is learning

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Git
- MongoDB (local or cloud)
- GitHub account

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/devdeck.git
   cd devdeck
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-owner/devdeck.git
   ```

3. **Run the setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

4. **Configure environment variables**
   - Update `.env`, `backend/.env`, and `frontend/.env.local`
   - Add your GitHub OAuth credentials
   - Configure MongoDB connection

5. **Start development servers**
   ```bash
   npm run dev
   ```

## 🛠️ How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix issues and improve stability
- **New features**: Add new functionality
- **Documentation**: Improve docs, tutorials, and examples
- **Performance**: Optimize code and improve performance
- **UI/UX**: Enhance user interface and experience
- **Testing**: Add tests and improve test coverage
- **Refactoring**: Improve code structure and maintainability

### Finding Issues to Work On

- Check the [Issues](https://github.com/your-repo/devdeck/issues) page
- Look for issues labeled `good first issue` for beginners
- Issues labeled `help wanted` are great for contributors
- Feel free to ask questions in issue comments

## 🔄 Pull Request Process

### Before You Start

1. **Check existing issues**: Make sure your contribution isn't already being worked on
2. **Create an issue**: For new features, create an issue to discuss the approach
3. **Assign yourself**: Comment on the issue to let others know you're working on it

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes**
   - Follow the coding standards
   - Write tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new portfolio theme system"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear, descriptive title
   - Fill out the PR template
   - Link related issues
   - Add screenshots for UI changes

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(portfolio): add drag and drop functionality
fix(auth): resolve GitHub OAuth callback issue
docs(readme): update installation instructions
test(api): add unit tests for user routes
```

## 📝 Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Use meaningful variable and function names
- Add comments for complex logic
- Follow the existing code style
- Keep functions small and focused

### Frontend (Next.js/React)

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Implement responsive design
- Use Shadcn/ui components when possible
- Follow the component structure:
  ```
  components/
  ├── ui/           # Reusable UI components
  ├── forms/        # Form components
  ├── layout/       # Layout components
  └── features/     # Feature-specific components
  ```

### Backend (Node.js/Express)

- Use ES6+ features
- Follow RESTful API conventions
- Implement proper error handling
- Use middleware for common functionality
- Validate input data
- Follow the project structure:
  ```
  backend/src/
  ├── config/       # Configuration files
  ├── controllers/  # Route controllers
  ├── middleware/   # Express middleware
  ├── models/       # Database models
  ├── routes/       # API routes
  ├── services/     # Business logic
  └── utils/        # Utility functions
  ```

### Database

- Use descriptive field names
- Add proper indexes for performance
- Implement data validation
- Use transactions for related operations

## 🧪 Testing Guidelines

### Frontend Testing

- Write unit tests for components using Jest and React Testing Library
- Test user interactions and edge cases
- Mock external dependencies
- Aim for good test coverage

```bash
# Run frontend tests
cd frontend
npm run test
npm run test:coverage
```

### Backend Testing

- Write unit tests for routes and services
- Use supertest for API testing
- Mock database operations
- Test error scenarios

```bash
# Run backend tests
cd backend
npm run test
npm run test:coverage
```

### Integration Testing

- Test complete user workflows
- Test API endpoints with real database
- Use test databases for integration tests

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions and classes
- Document complex algorithms and business logic
- Keep README files up to date

### API Documentation

- Document all API endpoints
- Include request/response examples
- Document error responses
- Use tools like Swagger/OpenAPI when possible

### User Documentation

- Update user guides for new features
- Add screenshots and examples
- Keep installation instructions current

## 🐛 Issue Reporting

When reporting bugs, please include:

1. **Clear description**: What happened vs. what you expected
2. **Steps to reproduce**: Detailed steps to recreate the issue
3. **Environment**: OS, browser, Node.js version, etc.
4. **Screenshots**: For UI issues
5. **Error messages**: Full error messages and stack traces
6. **Additional context**: Any other relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
Add screenshots if applicable.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Node.js version: [e.g. 18.17.0]
- DevDeck version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

When requesting features:

1. **Check existing requests**: Search for similar feature requests
2. **Describe the problem**: What problem does this solve?
3. **Propose a solution**: How should this feature work?
4. **Consider alternatives**: Are there other ways to solve this?
5. **Additional context**: Why is this feature important?

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Screenshots, mockups, or other context.
```

## 🏷️ Labels and Milestones

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority: high`: High priority issue
- `priority: low`: Low priority issue
- `frontend`: Frontend-related issue
- `backend`: Backend-related issue
- `ui/ux`: User interface/experience

## 🎯 Development Tips

### Performance

- Optimize database queries
- Use proper caching strategies
- Minimize bundle sizes
- Optimize images and assets

### Security

- Validate all user inputs
- Use HTTPS in production
- Implement proper authentication
- Follow OWASP guidelines

### Accessibility

- Use semantic HTML
- Implement proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## 🤔 Questions?

If you have questions:

1. Check the [documentation](README.md)
2. Search [existing issues](https://github.com/your-repo/devdeck/issues)
3. Create a new issue with the `question` label
4. Join our community discussions

## 🙏 Recognition

We appreciate all contributions! Contributors will be:

- Listed in our README
- Mentioned in release notes
- Invited to our contributor community

Thank you for helping make DevDeck better! 🚀