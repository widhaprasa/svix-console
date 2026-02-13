# Svix Console

This is a web-based UI for the open source [Svix](https://github.com/svix/svix-webhooks) webhook delivery platform. It's designed for self-hosted Svix instances, providing an intuitive interface to interact with your own Svix webhook infrastructure, monitor deliveries, and manage webhook endpoints.

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Svix account and API token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/widhaprasa/svix-console.git
   cd svix-console
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Update the following variables in `.env.local`:
   ```env
   # Svix API Configuration
   SVIX_API_URL=https://api.svix.com
   SVIX_API_TOKEN=your_svix_api_token_here
   
   # Admin Authentication  
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password_here
   
   # Next.js
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) and log in with your admin credentials.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SVIX_API_URL` | Base URL for Svix API (usually https://api.svix.com) | Yes |
| `SVIX_API_TOKEN` | Your Svix API authentication token | Yes | 
| `ADMIN_USERNAME` | Admin login username | Yes |
| `ADMIN_PASSWORD` | Admin login password | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## License

This project is licensed under the MIT License - see the LICENSE file for details.
