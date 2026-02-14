import { NextRequest } from 'next/server';
import { getMultiByUsername, type MultiConfig } from './multi-config';

export interface AuthData {
  authenticated: boolean;
  username: string;
  expiresAt: number;
}

/**
 * Extract authentication data from request cookies
 */
export function getAuthDataFromRequest(request: NextRequest): AuthData | null {
  try {
    const authCookie = request.cookies.get('svix-console-auth');
    
    if (!authCookie) {
      return null;
    }

    const authData = JSON.parse(authCookie.value) as AuthData;
    
    // Check if token is expired
    if (!authData.authenticated || authData.expiresAt < Date.now()) {
      return null;
    }

    return authData;
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
    return null;
  }
}

/**
 * Get multi-specific Svix configuration for the authenticated user
 */
export function getMultiSvixConfig(request: NextRequest): MultiConfig | null {
  const authData = getAuthDataFromRequest(request);
  
  if (!authData) {
    return null;
  }

  const multi = getMultiByUsername(authData.username);

  if (!multi) {
    return null;
  }

  return multi.config;
}

/**
 * Get multi-specific Svix configuration by username (for server-side usage)
 */
export function getMultiSvixConfigByUsername(username: string): MultiConfig | null {
  const multi = getMultiByUsername(username);
  return multi ? multi.config : null;
}

/**
 * Check if user is authenticated and return auth data
 */
export function requireAuth(request: NextRequest): { authData: AuthData; config: MultiConfig } | null {
  const authData = getAuthDataFromRequest(request);
  
  if (!authData) {
    return null;
  }

  const config = getMultiSvixConfigByUsername(authData.username);
  
  if (!config) {
    return null;
  }

  return { authData, config };
}

/**
 * Create standardized unauthorized response
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Create standardized forbidden response  
 */
export function createForbiddenResponse(message: string = 'Access forbidden') {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Utility to create authenticated fetch with multi Svix credentials
 */
export async function createMultiSvixRequest(
  config: MultiConfig,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = new URL(path, config.svixApiUrl);
  
  const defaultHeaders = {
    'Authorization': `Bearer ${config.svixApiToken}`,
    'Content-Type': 'application/json',
  };

  return fetch(url.toString(), {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
}