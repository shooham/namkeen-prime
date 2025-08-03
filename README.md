# Namkeen Prime - Premium Streaming Platform

A modern, futuristic streaming platform built with React, TypeScript, and Vite. Experience premium web series with cutting-edge design and seamless user experience.

## 🚀 Features

- **Modern UI/UX**: Futuristic holo-themed design with smooth animations
- **Authentication**: Secure Google OAuth integration via Supabase
- **Payment Integration**: Razorpay payment gateway for subscriptions
- **Video Streaming**: HLS video player with adaptive streaming
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Real-time Updates**: Live subscription status and user data
- **Premium Content**: Subscription-based access control

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Razorpay
- **Video**: HLS.js for video streaming
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd namkeen-prime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on every push

### Environment Variables for Production

Set these in your Vercel dashboard:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_RAZORPAY_KEY_ID`: Your Razorpay key ID

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── utils/              # Utility functions
├── lib/                # Library configurations
└── integrations/       # Third-party integrations

supabase/
├── functions/          # Edge functions
└── migrations/         # Database migrations
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design System

The project uses a custom holo-futurism design system with:

- **Colors**: Green primary (#49B618), Neon accent (#76FF03)
- **Typography**: Orbitron font for headings
- **Animations**: Smooth transitions and glow effects
- **Components**: Custom shadcn/ui components

## 🔐 Authentication Flow

1. Google OAuth via Supabase
2. Automatic user profile creation
3. Session management
4. Protected routes

## 💳 Payment Integration

- Razorpay payment gateway
- Subscription plans (Free, Premium, Pro, Ultimate)
- Secure payment processing
- Webhook handling for payment verification

## 📱 Mobile Support

- Responsive design for all screen sizes
- Mobile-optimized navigation
- Touch-friendly interactions
- Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions, please contact the development team.
