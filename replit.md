# Mangues 1.0

## Overview

Mangues 1.0 is an interactive educational platform designed to teach children about mangrove ecosystems. The application provides an engaging learning experience through various sections covering biodiversity, ecosystem structure, environmental threats, and interactive games. Built as a full-stack web application, it combines educational content with gamification to make learning about mangrove conservation fun and accessible for young learners.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component development
- **Routing**: React Router DOM v7 for client-side navigation between educational sections
- **Styling**: Tailwind CSS for utility-first styling with custom animations and responsive design
- **State Management**: React Context API with useReducer for game state management
- **Build Tool**: Vite for fast development and optimized production builds
- **Code Quality**: ESLint with TypeScript support and React-specific rules

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Security**: Helmet for security headers, CORS for cross-origin requests, and express-rate-limit for API protection
- **Data Layer**: Static JSON files serving as mock database for educational content (species, threats, game data)
- **API Structure**: RESTful endpoints organized by feature (especies, ameacas, jogo)

### Component Architecture
- **Custom Hooks**: useApi hook for data fetching with loading and error states
- **Context Providers**: GameProvider for managing game state across components
- **Reusable Components**: LoadingSpinner, ErrorMessage, and Navbar for consistent UI
- **Page Components**: Dedicated pages for each educational section and games

### Game Systems
- **Memory Game**: Card-flipping game with scoring, difficulty levels, and time tracking
- **Connection Game**: Interactive game for matching animals with their special abilities
- **Scoring System**: Points-based system with attempt tracking and time bonuses

### Content Management
- **Educational Content**: Structured data for species information, ecosystem threats, and conservation solutions
- **Multilingual Support**: Content in Portuguese targeting Brazilian children
- **Accessibility**: Child-friendly language and emoji-based visual representations

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: react, react-dom, react-router-dom for core functionality
- **Icons**: lucide-react for consistent iconography
- **Development Tools**: TypeScript, Vite, ESLint for development workflow
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer for styling pipeline

### Backend Dependencies
- **Server Framework**: Express.js for API server
- **Security Middleware**: helmet, cors, express-rate-limit for API security
- **Development Tools**: nodemon for development server auto-restart

### Build and Development Tools
- **Package Manager**: npm for dependency management
- **TypeScript Configuration**: Separate configs for app and Node.js environments
- **Linting**: ESLint with TypeScript and React-specific rules
- **CSS Processing**: PostCSS with Tailwind and Autoprefixer plugins

### Hosting and Deployment
- **Frontend**: Vite build process creating optimized static files
- **Backend**: Express server ready for Node.js hosting environments
- **Environment Configuration**: Development and production environment support