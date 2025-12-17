# Reef AI App 🐠

An AI-powered reef aquarium builder that helps you design balanced, compatible saltwater tanks with real-time analysis, image recognition, and comprehensive aquarium management tools.

[![Live Demo](https://img.shields.io/badge/🌊_Live_Demo-reefai--cd607.web.app-blue?style=for-the-badge)](https://reefai-cd607.web.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

## ✨ Features

### 🏗️ **Tank Setup Builder**
- **Interactive Setup Designer**: Build custom reef tank configurations with drag-and-drop interface
- **Species Compatibility**: Real-time compatibility analysis between fish, corals, and invertebrates
- **Equipment Recommendations**: AI-powered suggestions for filtration, lighting, and other equipment
- **Parameter Monitoring**: Track water parameters, temperature, and tank conditions
- **Setup Scoring**: Get comprehensive scores and recommendations for your tank design

### 🤖 **AI-Powered Analysis**
- **GPT-4o Vision Integration**: Upload photos of your tank for instant AI analysis
- **Real-time Image Analysis**: Get detailed assessments of fish health, coral condition, and overall tank status
- **Equipment Assessment**: AI evaluation of your current equipment setup
- **General Tank Assessment**: Comprehensive analysis with actionable recommendations
- **Smart Fallback System**: Robust error handling with intelligent response parsing

### 📸 **Image Management**
- **Secure Image Upload**: Upload tank photos with automatic compression and validation
- **Image History**: Save and manage all your tank images with timestamps
- **Analysis Results**: View detailed AI analysis results for each uploaded image
- **Public Image Display**: Fast-loading images with persistent URLs
- **Batch Operations**: Delete multiple images with bulk selection

### 👤 **User Profile Management**
- **Profile Dashboard**: View and edit user information including display name and email
- **Profile Images**: Upload, display, and remove profile pictures with automatic resizing
- **Account Information**: Track account creation date and membership details
- **Secure Authentication**: Supabase Auth integration with email/password and social logins
- **Real-time Updates**: Profile changes reflect immediately across the application

### 🏪 **Saved Tank Setups**
- **Setup Library**: Save and organize multiple tank configurations
- **Quick Access**: Browse your saved setups with visual previews
- **Setup Management**: Edit, duplicate, or delete saved configurations
- **Setup Sharing**: Export setup details for sharing with others

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript for type-safe component development
- **Material-UI (MUI) v7** for consistent, accessible UI components
- **Vite** for fast development and optimized production builds
- **React Router** for client-side navigation
- **Redux Toolkit** for state management
- **Nivo Charts** for data visualization and tank analytics

### **Backend**
- **Supabase** as Backend-as-a-Service platform
- **Supabase Edge Functions** for serverless API endpoints (8 functions deployed)
- **Supabase Auth** for user authentication and authorization
- **Supabase Storage** for secure file uploads and management
- **Row Level Security (RLS)** for data protection

### **AI & Analytics**
- **OpenAI GPT-4o Vision** for advanced image analysis
- **Custom AI Prompts** for reef-specific analysis and recommendations
- **Intelligent Fallback Parsing** for robust AI response handling

### **Infrastructure**
- **Firebase Hosting** for global CDN deployment
- **Supabase Cloud** for database and real-time features
- **GitHub Actions** ready for CI/CD pipeline

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/markon87/reef-ai-app.git
   cd reef-ai-app
   ```

2. **Install dependencies**
   ```bash
   # Client dependencies
   cd client && npm install

   # Return to root for Supabase setup
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment templates
   cp client/.env.example client/.env.local
   
   # Add your keys to client/.env.local
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=your_supabase_functions_url
   ```

4. **Database Setup**
   ```bash
   # Install Supabase CLI
   npm install -g @supabase/cli
   
   # Link to your project
   supabase link --project-ref your-project-id
   
   # Push database schema and storage setup
   supabase db push
   ```

5. **Deploy Edge Functions**
   ```bash
   # Deploy all functions
   supabase functions deploy analyze
   supabase functions deploy analyze-image  
   supabase functions deploy analyze-saved-image
   supabase functions deploy upload-image
   supabase functions deploy manage-images
   supabase functions deploy upload-profile-image
   supabase functions deploy update-profile
   supabase functions deploy remove-profile-image
   ```

6. **Start Development**
   ```bash
   cd client && npm run dev
   ```

## 📋 Supabase Edge Functions

The application uses 8 serverless Edge Functions for backend operations:

| Function | Purpose | Method |
|----------|---------|---------|
| `analyze` | General tank setup analysis | POST |
| `analyze-image` | Real-time image analysis with GPT-4o Vision | POST |
| `analyze-saved-image` | Analyze previously uploaded images | POST |
| `upload-image` | Secure tank image uploads | POST |
| `manage-images` | Get/delete user tank images | GET/DELETE |
| `upload-profile-image` | Profile picture upload | POST |
| `update-profile` | Update user profile information | POST |
| `remove-profile-image` | Remove profile pictures | DELETE |

## 🗄️ Database Schema

### Core Tables
- **`user_tank_images`**: Stores uploaded tank images with metadata
- **Storage buckets**: `tank-images` and `profile-images` for file storage
- **RLS Policies**: User-scoped access control for all data

### Authentication
- **Supabase Auth Users**: Email/password authentication
- **User Metadata**: Display names and profile information
- **Session Management**: Secure JWT token handling

## 🎨 UI Components

### Key Components
- **`TankSetupForm`**: Interactive tank builder interface
- **`ImageAnalysisPage`**: AI-powered image analysis dashboard
- **`ProfilePage`**: User profile management with image upload
- **`SavedTankImages`**: Image gallery with analysis results
- **`UserMenu`**: Navigation and authentication controls
- **`Layout`**: Consistent application shell with responsive design

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **User-scoped file access** with Supabase Storage policies
- **Secure file uploads** with type and size validation
- **JWT authentication** with automatic token refresh
- **CORS protection** on all API endpoints
- **Input validation** and sanitization

## 🚀 Deployment

### Production Deployment
```bash
# Build for production
cd client && npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Edge Functions are automatically deployed via Supabase
```

### Environment Variables (Production)
Set these in your Supabase project settings:
- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4o Vision
- `SUPABASE_URL`: Auto-configured
- `SUPABASE_ANON_KEY`: Auto-configured  
- `SUPABASE_SERVICE_ROLE_KEY`: For admin operations

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Bundle Size**: ~1MB gzipped with code splitting
- **Image Optimization**: Automatic compression and WebP conversion
- **Edge Functions**: <100ms cold start, global deployment
- **CDN**: Firebase global edge network

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o Vision API
- **Supabase** for the amazing Backend-as-a-Service platform
- **Material-UI** for the component library
- **Firebase** for reliable hosting
- **Reef aquarium community** for domain expertise and testing

---

**Built with ❤️ for the reef aquarium community**

[🌊 Try the live demo](https://reefai-cd607.web.app) | [📧 Report Issues](https://github.com/markon87/reef-ai-app/issues) | [💬 Discussions](https://github.com/markon87/reef-ai-app/discussions)
