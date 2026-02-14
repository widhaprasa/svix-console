export interface MultiConfig {
  svixApiUrl: string;
  svixApiToken: string;
}

export interface MultiCredentials {
  username: string;
  password: string;
  config: MultiConfig;
}

/**
 * Parse multi configurations from environment variables
 * Supports backward compatibility and prefixed environment variables
 */
function parseMultiConfigsFromEnv(): Record<string, MultiCredentials> {
  const configs: Record<string, MultiCredentials> = {};

  // Method 1: Default multi (backward compatibility)
  if (process.env.CONSOLE_USERNAME && process.env.CONSOLE_PASSWORD) {
    configs[process.env.CONSOLE_USERNAME] = {
      username: process.env.CONSOLE_USERNAME,
      password: process.env.CONSOLE_PASSWORD,
      config: {
        svixApiUrl: process.env.SVIX_API_URL || '',
        svixApiToken: process.env.SVIX_API_TOKEN || ''
      }
    };
  }

  // Method 2: Prefixed environment variables (recommended for multi setups)
  // Format: MULTI_1_CONSOLE_USERNAME, MULTI_1_CONSOLE_PASSWORD, MULTI_1_SVIX_API_URL, MULTI_1_SVIX_API_TOKEN
  const envKeys = Object.keys(process.env);
  const multiPrefixes = new Set<string>();
  
  // Find all multi prefixes
  for (const key of envKeys) {
    const match = key.match(/^MULTI_(\w+)_CONSOLE_USERNAME$/);
    if (match) {
      multiPrefixes.add(match[1]);
    }
  }

  // Process each multi prefix
  for (const prefix of multiPrefixes) {
    const username = process.env[`MULTI_${prefix}_CONSOLE_USERNAME`];
    const password = process.env[`MULTI_${prefix}_CONSOLE_PASSWORD`];
    const svixApiUrl = process.env[`MULTI_${prefix}_SVIX_API_URL`];
    const svixApiToken = process.env[`MULTI_${prefix}_SVIX_API_TOKEN`];
    
    if (username && password && svixApiUrl && svixApiToken) {
      configs[username] = {
        username,
        password,
        config: {
          svixApiUrl,
          svixApiToken
        }
      };
    }
  }

  return configs;
}

// Multi configurations - loaded from environment variables
export const MULTI_CONFIGS: Record<string, MultiCredentials> = parseMultiConfigsFromEnv();

/**
 * get configuration by username
 */
export function getMultiByUsername(username: string): MultiCredentials | null {
  return MULTI_CONFIGS[username] || null;
}

/**
 * Validate multi credentials
 */
export function validateMultiCredentials(username: string, password: string): MultiCredentials | null {
  const multi = getMultiByUsername(username);
  if (multi && multi.password === password) {
    return multi;
  }
  return null;
}

/**
 * Get all multi usernames
 */
export function getAllMultiUsernames(): string[] {
  return Object.keys(MULTI_CONFIGS);
}

/**
 * Add or update multi configuration (runtime)
 */
export function updateMultiConfig(username: string, credentials: MultiCredentials): void {
  MULTI_CONFIGS[username] = credentials;
}
