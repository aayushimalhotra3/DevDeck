// MongoDB initialization script for Docker
// This script runs when the MongoDB container starts for the first time

// Switch to the devdeck database
db = db.getSiblingDB('devdeck');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['githubId', 'username', 'email'],
      properties: {
        githubId: {
          bsonType: 'string',
          description: 'GitHub user ID is required'
        },
        username: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9_-]{3,30}$',
          description: 'Username must be 3-30 characters, alphanumeric with hyphens and underscores'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Valid email address is required'
        }
      }
    }
  }
});

db.createCollection('portfolios', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'User ID is required'
        },
        status: {
          enum: ['draft', 'published', 'archived'],
          description: 'Status must be draft, published, or archived'
        }
      }
    }
  }
});

// Create indexes for better performance

// Users collection indexes
db.users.createIndex({ 'githubId': 1 }, { unique: true });
db.users.createIndex({ 'username': 1 }, { unique: true });
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'profile.username': 1 });
db.users.createIndex({ 'createdAt': 1 });
db.users.createIndex({ 'lastLoginAt': 1 });
db.users.createIndex({ 'settings.privacy.profileVisibility': 1 });

// Portfolios collection indexes
db.portfolios.createIndex({ 'userId': 1 }, { unique: true });
db.portfolios.createIndex({ 'status': 1 });
db.portfolios.createIndex({ 'isPublished': 1 });
db.portfolios.createIndex({ 'createdAt': 1 });
db.portfolios.createIndex({ 'updatedAt': 1 });
db.portfolios.createIndex({ 'seo.slug': 1 });
db.portfolios.createIndex({ 'customDomain': 1 }, { sparse: true });
db.portfolios.createIndex({ 'analytics.totalViews': 1 });
db.portfolios.createIndex({ 'analytics.lastViewedAt': 1 });

// Compound indexes for common queries
db.portfolios.createIndex({ 'userId': 1, 'status': 1 });
db.portfolios.createIndex({ 'isPublished': 1, 'updatedAt': -1 });
db.users.createIndex({ 'settings.privacy.profileVisibility': 1, 'createdAt': -1 });

// Text indexes for search functionality
db.users.createIndex({
  'username': 'text',
  'profile.name': 'text',
  'profile.bio': 'text'
}, {
  name: 'user_search_index',
  weights: {
    'username': 10,
    'profile.name': 5,
    'profile.bio': 1
  }
});

db.portfolios.createIndex({
  'content.bio.content': 'text',
  'content.projects.title': 'text',
  'content.projects.description': 'text',
  'content.skills.name': 'text',
  'seo.title': 'text',
  'seo.description': 'text'
}, {
  name: 'portfolio_search_index',
  weights: {
    'seo.title': 10,
    'content.projects.title': 8,
    'content.bio.content': 5,
    'content.projects.description': 3,
    'seo.description': 3,
    'content.skills.name': 1
  }
});

// Create a user for application access (if needed)
db.createUser({
  user: 'devdeck_app',
  pwd: 'devdeck_password',
  roles: [
    {
      role: 'readWrite',
      db: 'devdeck'
    }
  ]
});

// Insert some sample data for development (optional)
if (db.users.countDocuments() === 0) {
  print('Inserting sample data...');
  
  // Sample user
  const sampleUserId = new ObjectId();
  db.users.insertOne({
    _id: sampleUserId,
    githubId: '12345678',
    username: 'sampleuser',
    email: 'sample@example.com',
    profile: {
      name: 'Sample User',
      bio: 'A sample developer portfolio',
      location: 'San Francisco, CA',
      website: 'https://example.com',
      avatar_url: 'https://github.com/identicons/sampleuser.png',
      social: {
        twitter: 'sampleuser',
        linkedin: 'sampleuser'
      }
    },
    githubData: {
      public_repos: 25,
      followers: 100,
      following: 50
    },
    settings: {
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showLocation: true
      },
      portfolio: {
        theme: 'default',
        customDomain: null
      }
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  });
  
  // Sample portfolio
  db.portfolios.insertOne({
    userId: sampleUserId,
    content: {
      bio: {
        type: 'bio',
        content: 'Welcome to my developer portfolio! I\'m passionate about building amazing web applications.',
        order: 0,
        isVisible: true
      },
      projects: [
        {
          id: new ObjectId().toString(),
          type: 'project',
          title: 'Sample Project',
          description: 'A sample project showcasing modern web development',
          technologies: ['React', 'Node.js', 'MongoDB'],
          githubUrl: 'https://github.com/sampleuser/sample-project',
          liveUrl: 'https://sample-project.vercel.app',
          order: 1,
          isVisible: true
        }
      ],
      skills: [
        {
          id: new ObjectId().toString(),
          type: 'skill',
          name: 'JavaScript',
          level: 'Advanced',
          order: 2,
          isVisible: true
        },
        {
          id: new ObjectId().toString(),
          type: 'skill',
          name: 'React',
          level: 'Advanced',
          order: 3,
          isVisible: true
        }
      ]
    },
    layout: {
      template: 'default',
      sections: ['bio', 'projects', 'skills'],
      customCSS: ''
    },
    theme: {
      name: 'default',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      }
    },
    seo: {
      title: 'Sample User - Developer Portfolio',
      description: 'Full-stack developer passionate about creating amazing web experiences',
      keywords: ['developer', 'portfolio', 'web development', 'react', 'node.js'],
      slug: 'sampleuser'
    },
    analytics: {
      totalViews: 0,
      uniqueVisitors: 0,
      lastViewedAt: null,
      viewHistory: []
    },
    status: 'published',
    isPublished: true,
    publishedAt: new Date(),
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('Sample data inserted successfully!');
}

print('MongoDB initialization completed!');