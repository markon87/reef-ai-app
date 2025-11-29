# ReefAI Changelog

## Version 1.2.0 (October 30, 2025)

### 🎨 Major Theme System Update
- **Custom ReefAI Color Palette**: Implemented brand new color system with deep ocean blues, vibrant aquas, and sea-green accents
- **Dark/Light Theme Toggle**: Added comprehensive dark and light theme support with theme switching buttons
- **CSS Custom Properties**: Integrated CSS variables for consistent theming across the entire application
- **Enhanced Visual Design**: Improved gradients, shadows, and visual effects using the new color palette

### 🎯 New Color System
- **Base Colors**: Deep ocean blue (#003C71), Vibrant aqua (#00AEEF), Soft water highlight (#66D3FA)
- **Light Theme**: Clean white backgrounds with aqua-tinted surfaces and deep blue text
- **Dark Theme**: Deep navy backgrounds with soft aqua text and sea-green accents
- **Consistent Branding**: All components now use the unified ReefAI color palette

### ⚙️ Technical Improvements
- **Theme Context**: Added React context for theme management and persistence
- **Material-UI Integration**: Complete theme integration with Material-UI components
- **Local Storage**: Theme preference saved and restored across browser sessions
- **System Preference Detection**: Automatically detects user's system theme preference

### 🔧 Component Updates
- **Navigation**: Theme toggle buttons in both landing page and main app navigation
- **Cards & Papers**: Enhanced with new glass-morphism effects and shadows
- **Buttons**: Updated with gradient backgrounds using the new color palette
- **Typography**: Improved readability with proper contrast ratios for both themes

### 📱 User Experience
- **Seamless Switching**: Smooth transitions between light and dark modes
- **Visual Consistency**: All components maintain design consistency across themes
- **Better Accessibility**: Improved contrast ratios and focus indicators
- **Professional Appearance**: More polished and modern visual design

---

## Version 1.1.1 (October 29, 2025)

### 🐛 Bug Fixes
- **Authentication**: Fixed logout 403 error in production by using local scope instead of global scope
- **Production Stability**: Resolved Supabase authentication logout issues on deployed app

---

## Version 1.1.0 (October 29, 2025)

### ✨ New Features
- **Landing Page**: Added beautiful, professional landing page for unauthenticated users
- **Modern UI Styling**: Applied ocean-themed design with gradients and glass-morphism effects
- **Smart Species Selection**: Tank setup form now prevents duplicate species and auto-selects next available species

### 🔧 Technical Improvements
- **API Migration**: Updated from Express server to Supabase Edge Functions
- **Authentication Enhancement**: Improved handling of authenticated and anonymous API requests
- **UI Components**: Modernized all cards, buttons, and layout components with consistent styling
- **TypeScript**: Fixed all type errors and improved code quality

### 🎨 Design Updates
- **Gradient Backgrounds**: Subtle ocean-themed gradients throughout the app
- **Navigation**: Modern sticky navigation with backdrop blur effects
- **Buttons**: Enhanced with gradient styling and proper hover states
- **Cards**: Rounded corners, modern shadows, and improved visual hierarchy
- **Branding**: Consistent ReefAI branding across all interfaces

### 🚀 Performance
- **Build Optimization**: Clean TypeScript compilation with no errors
- **Responsive Design**: Improved mobile and desktop layouts
- **Loading States**: Better user feedback during API calls

### 🔒 Security
- **Environment Variables**: Proper configuration for different deployment environments
- **Authentication**: Secure JWT token handling for API requests

### 📱 User Experience
- **Landing Experience**: Professional marketing page that converts visitors to users
- **Form Intelligence**: Tank setup form prevents duplicate entries and guides user selections
- **Visual Feedback**: Clear indication of disabled options and loading states
- **Seamless Flow**: Smooth transition from landing page to authenticated app experience

### 🌐 Deployment
- **Firebase Hosting**: Successfully deployed to production
- **Supabase Integration**: Full integration with Edge Functions for AI analysis
- **Environment Setup**: Proper configuration for production environment

---

**Live App**: https://reefai-cd607.web.app
**Version**: 1.1.0
**Release Date**: October 29, 2025