# Svix Console

This is a web-based UI for the open source [Svix](https://github.com/svix/svix-webhooks) webhook delivery platform. It's designed for self-hosted Svix instances, providing an intuitive interface to interact with your own Svix webhook infrastructure, monitor deliveries, and manage webhook endpoints.

## Getting Started

### Prerequisites

- Node.js 20+ 
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
   
   **Option 1: Single Svix (Basic Setup)**
   ```env
   # Svix API Configuration
   SVIX_API_URL=https://api.svix.com
   SVIX_API_TOKEN=your_svix_api_token_here
   
   # Authentication  
   CONSOLE_USERNAME=user
   CONSOLE_PASSWORD=your_secure_password_here
   
   # Next.js
   NODE_ENV=development
   ```
   
   **Option 2: Multi-Svix (Advanced Setup)**
   
   Configure multiple svix, each with their own Svix API instance:
   ```env
   # Backward compatible default svix
   CONSOLE_USERNAME=user
   CONSOLE_PASSWORD=user_password
   SVIX_API_URL=https://api.svix.com
   SVIX_API_TOKEN=sk-user-token
   
   # Customer 1
   MULTI_CUSTOMER1_CONSOLE_USERNAME=customer1
   MULTI_CUSTOMER1_CONSOLE_PASSWORD=secure_password_1
   MULTI_CUSTOMER1_SVIX_API_URL=https://customer1.api.svix.com
   MULTI_CUSTOMER1_SVIX_API_TOKEN=sk-customer1-token
   
   # Customer 2
   MULTI_CUSTOMER2_CONSOLE_USERNAME=customer2
   MULTI_CUSTOMER2_CONSOLE_PASSWORD=secure_password_2
   MULTI_CUSTOMER2_SVIX_API_URL=https://customer2.api.svix.com
   MULTI_CUSTOMER2_SVIX_API_TOKEN=sk-customer2-token
   
   # Development environment
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) and log in with your credentials.

## Environment Variables

### Single Svix Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `CONSOLE_USERNAME` | Login username | Yes |
| `CONSOLE_PASSWORD` | Login password | Yes |
| `SVIX_API_URL` | Base URL for Svix API (usually https://api.svix.com) | Yes |
| `SVIX_API_TOKEN` | Your Svix API authentication token | Yes | 
| `NODE_ENV` | Environment (development/production) | No |

### Multi Svix Configuration

For multi-svix setups, you can configure multiple svix using prefixed environment variables. Each svix needs their own set of variables:

| Variable Pattern | Description | Required |
|------------------|-------------|----------|
| `MULTI_{NAME}_CONSOLE_USERNAME` | Login username for this setup | Yes |
| `MULTI_{NAME}_CONSOLE_PASSWORD` | Login password for this setup | Yes |
| `MULTI_{NAME}_SVIX_API_URL` | Svix API URL for this setup | Yes |
| `MULTI_{NAME}_SVIX_API_TOKEN` | Svix API token for this setup | Yes |

**Example:**
```env
# Config named "CUSTOMER1"
MULTI_CUSTOMER1_CONSOLE_USERNAME=customer1
MULTI_CUSTOMER1_CONSOLE_PASSWORD=secure_password
MULTI_CUSTOMER1_SVIX_API_URL=https://customer1.api.svix.com
MULTI_CUSTOMER1_SVIX_API_TOKEN=sk-customer1-token

# Config named "DEMO" 
MULTI_DEMO_CONSOLE_USERNAME=demo
MULTI_DEMO_CONSOLE_PASSWORD=demo_password
MULTI_DEMO_SVIX_API_URL=https://demo.api.svix.com
MULTI_DEMO_SVIX_API_TOKEN=sk-demo-token
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
