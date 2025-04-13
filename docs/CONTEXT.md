# Interactive Expense Tracker

## Overview
The Interactive Expense Tracker is a user-friendly application designed to help users manage their daily and monthly expenses efficiently. The app allows users to create predefined expense cards, drag them into designated areas to log expenses, and view detailed analytics of their spending patterns.

## Tech Stack
- Frontend: React Native with TypeScript, Expo, and Expo Router
- Backend/Database: Supabase
- UI Framework: React Native Paper
- AI Processing: DeepSeek

## Database Structure

### Tables

#### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb
);
```

#### 2. expense_cards
```sql
CREATE TABLE expense_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT false
);
```

#### 3. expenses
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expense_card_id UUID REFERENCES expense_cards(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. budgets
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  period TEXT NOT NULL, -- 'monthly', 'weekly', 'yearly'
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);

-- Expense Cards
CREATE INDEX idx_expense_cards_user_id ON expense_cards(user_id);

-- Expenses
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- Categories
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Budgets
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
```

## Project Structure
```
expense-tracker/
├── app/                      # Expo Router app directory
│   ├── (auth)/              # Authentication routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── dashboard.tsx
│   │   ├── expenses.tsx
│   │   ├── analytics.tsx
│   │   └── settings.tsx
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Shared components
│   │   ├── expenses/       # Expense-related components
│   │   ├── analytics/      # Analytics components
│   │   └── settings/       # Settings components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API and external services
│   │   ├── supabase.ts     # Supabase client
│   │   └── ai.ts          # AI processing service
│   ├── stores/            # State management
│   ├── types/             # TypeScript types/interfaces
│   ├── utils/             # Helper functions
│   └── constants/         # App constants
├── assets/                # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
├── docs/                  # Documentation
├── tests/                 # Test files
├── .env.example          # Environment variables example
├── app.json              # Expo config
├── babel.config.js       # Babel config
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md            # Project documentation
```

## App Flow

### 1. Welcome Screen
- Clean and minimalistic interface with app logo and tagline
- Sign Up and Log In options

### 2. User Authentication
- **Sign Up**
  - Email and password registration
  - Optional profile details
- **Log In**
  - Email/password authentication
  - Social login options

### 3. Main Dashboard
The dashboard serves as the central hub for expense management:

- **Total Expenses Overview**
  - Monthly total display
  - Current day's total

- **Analytical Charts**
  - Spending pattern visualizations
  - Interactive pie charts and bar graphs

- **Expense Cards Section**
  - Preset expense cards with predefined amounts
  - Drag & drop functionality for quick expense logging

- **Current Day's Expense Log**
  - Daily expense breakdown
  - Edit/remove expense options

### 4. Expense Cards Management
- Create, edit, and delete predefined expense cards
- Card components:
  - Expense name (e.g., "Coffee", "Groceries")
  - Fixed amount (editable)

### 5. Manual Expense Entry
- Custom expense logging
- Options to:
  - Enter expense name and amount
  - Save as future expense card

### 6. Expense History & Reports
- Comprehensive expense tracking:
  - Daily breakdowns
  - Monthly summaries
  - Category-wise distribution
- Advanced filtering and search capabilities

### 7. Settings & Customization
- User experience customization:
  - Theme selection (dark/light mode)
  - Currency preferences
  - Category management
  - Budget tracking notifications

### 8. Data Management
- Cloud synchronization
- Offline functionality
- Automatic data backup

## Core Features

| Feature | Description |
|---------|-------------|
| Drag & Drop Expenses | Quick expense logging through intuitive drag & drop interface |
| Predefined Expense Cards | Create and manage recurring expense templates |
| Expense Analytics | Real-time spending insights and visualizations |
| Manual Entry | Flexible custom expense logging |
| Historical Data | Comprehensive expense history and reporting |
| Customization | Personalize app experience and preferences |
| Cloud Sync | Secure data backup and cross-device synchronization |
| Offline Mode | Uninterrupted expense tracking without internet |

## Development Roadmap

### Phase 1: Project Setup & Authentication (Week 1)
1. **Initial Setup**
   - Initialize Expo project with TypeScript
   - Set up Expo Router
   - Configure ESLint and Prettier
   - Set up Git repository

2. **Supabase Integration**
   - Create Supabase project
   - Implement database schema
   - Set up authentication tables
   - Configure security rules

3. **Authentication Screens**
   - Implement login screen
   - Create registration screen
   - Add password recovery
   - Set up social authentication
   - Create protected routes

### Phase 2: Core Features Development (Week 2)
1. **Dashboard Implementation**
   - Create dashboard layout
   - Implement expense summary cards
   - Add basic charts and graphs
   - Set up real-time updates

2. **Expense Cards System**
   - Create expense card components
   - Implement drag & drop functionality
   - Add card management features
   - Set up card templates

3. **Expense Logging**
   - Implement manual expense entry
   - Create expense form
   - Add category selection
   - Set up date picker

### Phase 3: Data Management & Analytics (Week 3)
1. **Data Structure**
   - Implement local storage
   - Set up data synchronization
   - Create offline support
   - Add data validation

2. **Analytics Features**
   - Implement expense charts
   - Add spending patterns analysis
   - Create category breakdown
   - Set up budget tracking

3. **History & Reports**
   - Create expense history view
   - Implement filtering system
   - Add search functionality
   - Create export features

### Phase 4: UI/UX Enhancement (Week 4)
1. **Theme System**
   - Implement dark/light mode
   - Create custom theme
   - Add color schemes
   - Implement animations

2. **Responsive Design**
   - Optimize for different screen sizes
   - Add tablet support
   - Implement landscape mode
   - Create adaptive layouts

3. **User Experience**
   - Add loading states
   - Implement error handling
   - Create success messages
   - Add gesture support

### Phase 5: Testing & Optimization (Week 5)
1. **Testing**
   - Write unit tests
   - Implement integration tests
   - Add end-to-end tests
   - Perform performance testing

2. **Optimization**
   - Optimize bundle size
   - Improve load times
   - Enhance offline performance
   - Optimize database queries

3. **Documentation**
   - Create API documentation
   - Write component documentation
   - Add setup instructions
   - Create user guide

### Phase 6: Deployment & Launch (Week 6)
1. **Final Testing**
   - Perform security audit
   - Conduct user testing
   - Fix reported bugs
   - Optimize performance

2. **Deployment**
   - Prepare app store assets
   - Create store listings
   - Set up CI/CD pipeline
   - Configure production environment

3. **Launch**
   - Submit to app stores
   - Monitor analytics
   - Gather user feedback
   - Plan future updates

## Development Guidelines

### Code Standards
- Use TypeScript for type safety
- Follow React Native best practices
- Implement proper error handling
- Write clean, documented code

### Testing Requirements
- Unit tests for utilities
- Component tests for UI
- Integration tests for features
- E2E tests for critical flows

### Performance Metrics
- App size < 50MB
- Launch time < 2s
- Smooth animations (60fps)
- Offline functionality

### Security Measures
- Secure data transmission
- Encrypted local storage
- Regular security updates
- Input validation

## Development Priorities
1. Smooth drag & drop interactions
2. Real-time expense updates
3. User-friendly customization
4. Robust data handling
5. Cross-device synchronization
6. Offline functionality
7. Performance optimization
