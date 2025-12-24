# 🏠 Room-MatchPK

**A comprehensive property rental platform connecting students with hostels, apartments, houses, offices, and mess services in Pakistan.**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)

## 🌟 Features

### For Property Seekers
- 🔍 **Advanced Search & Filters** - Find properties by location, price, amenities, and more
- 🏠 **Multiple Property Types** - Hostels, apartments, houses, offices, and mess services
- 📱 **Responsive Design** - Seamless experience across all devices
- ⭐ **Reviews & Ratings** - Read authentic reviews from previous tenants
- 💬 **Real-time Chat** - Direct communication with property owners
- 📍 **Location-based Search** - Find properties near universities and key locations

### For Property Owners
- 📝 **Easy Property Listing** - Multi-step forms for different property types
- 📊 **Property Management Dashboard** - Track bookings, revenue, and performance
- 🖼️ **Image Management** - Upload and manage property photos with Cloudinary
- 📈 **Analytics & Insights** - Monitor property views and engagement
- 💰 **Revenue Tracking** - Keep track of earnings and occupancy rates
- 🔐 **Secure Authentication** - Google OAuth and custom authentication

### For Administrators
- 👥 **User Management** - Manage users, property owners, and administrators
- 🏢 **Property Moderation** - Review and approve property listings
- 💬 **Chat Management** - Monitor and manage user communications
- 📊 **Platform Analytics** - Comprehensive dashboard with key metrics
- 🛡️ **Security Controls** - Role-based access control and permissions

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB instance)
- **Cloudinary** account for image management
- **Google Cloud Console** account for OAuth

### Installation

1. **Clone the repository**
   ```bash
   git clone this repo
   cd RoomMatchPK.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.template .env.local
   ```
   Fill in the required environment variables (see [Environment Variables](#environment-variables) section)

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Database Configuration
```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=roommatch_pk
```

### Authentication
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### Admin Configuration
```env
NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL=admin@roommatchpk.com
DEFAULT_ADMIN_PASSWORD=your_admin_password
DEFAULT_ADMIN_NAME=Admin User
```

### Cloudinary (Image Management)
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

See `.env.template` for a complete list of required variables.

## 📁 Project Structure

```
Room-MatchPK/
├── public/                 # Static assets
│   ├── images/            # Property type icons and logos
│   └── favicon/           # Favicon files
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── find-rooms/    # Property search
│   │   ├── list-property/ # Property listing
│   │   └── property/      # Property details
│   ├── components/        # Reusable UI components
│   │   ├── forms/         # Form components
│   │   └── ui/            # Base UI components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── scripts/               # Build and deployment scripts
└── types/                 # Global type definitions
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Setup and Testing
npm run setup        # Setup environment
npm run verify-oauth # Verify OAuth configuration
npm run test-oauth   # Test OAuth functionality
```

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.3.4** - React framework with App Router
- **React 19.1.1** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Framer Motion** - Animations
- **Radix UI** - Accessible UI components
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication
- **MongoDB** - Database
- **Cloudinary** - Image management
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🔐 Authentication

The platform supports multiple authentication methods:

1. **Google OAuth** - Sign in with Google account
2. **Email/Password** - Traditional registration and login
3. **Role-based Access** - Different permissions for users, property owners, and admins

### User Roles
- **Student** - Can search and book properties
- **Property Owner** - Can list and manage properties
- **Admin** - Full platform management access

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/session` - Get current session

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create new property
- `GET /api/properties/[id]` - Get property by ID
- `PUT /api/properties/[id]` - Update property
- `DELETE /api/properties/[id]` - Delete property
- `GET /api/properties/owner` - Get owner's properties

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/messages` - Send message
- `GET /api/chat/messages/[conversationId]` - Get conversation messages

## 🎨 UI Components

The project uses a comprehensive design system built with:

- **Radix UI** - Accessible, unstyled components
- **Tailwind CSS** - Utility-first styling
- **Custom Components** - Property cards, forms, modals, etc.
- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - Theme switching capability

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Automatic deployments on push to main branch

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run start
   ```

### Environment Setup for Production

- Update `NEXTAUTH_URL` to your production domain
- Configure MongoDB Atlas for production
- Set up Cloudinary for image hosting
- Configure Google OAuth for production domain

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Verify your MongoDB URI
   - Check network access in MongoDB Atlas
   - Ensure IP whitelist includes your deployment IP

2. **OAuth Configuration**
   - Verify Google OAuth credentials
   - Check authorized redirect URIs
   - Ensure NEXTAUTH_URL matches your domain

3. **Image Upload Issues**
   - Verify Cloudinary credentials
   - Check API key permissions
   - Ensure cloud name is correct

4. **Build Errors**
   - Clear `.next` folder and rebuild
   - Check for TypeScript errors
   - Verify all environment variables are set

### Getting Help

- Check the [Issues](https://github.com/your-username/Room-MatchPK/issues) page
- Create a new issue with detailed description
- Include error messages and steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Ali Hamza** - Lead Developer
- **Hamid Tech Ventures** - Development Team

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- MongoDB for database services
- Cloudinary for image management
- All contributors and users of the platform

---

**Made with ❤️ for the student community in Pakistan**

For more information, visit [www.roommatchpk.com](https://www.roommatchpk.com)