import { NextRequest, NextResponse } from 'next/server';
import { validateMultiCredentials } from '../../../../lib/multi-config';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Validate credentials using multi configuration
    const multi = validateMultiCredentials(username, password);

    if (!multi) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Verify multi has valid Svix configuration
    if (!multi.config.svixApiUrl || !multi.config.svixApiToken) {
      return NextResponse.json(
        { error: 'Multi Svix configuration not found' },
        { status: 500 }
      );
    }
    
    // Create auth token (expires in 1 hour)
    const expiresAt = Date.now() + (60 * 60 * 1000);
    const authData = {
      authenticated: true,
      username,
      expiresAt
    };
    
    const response = NextResponse.json({ 
      success: true,
      multi: {
        username: multi.username,
        svixApiUrl: multi.config.svixApiUrl
      }
    });
    
    // Set httpOnly cookie for security
    response.cookies.set({
      name: 'svix-console-auth',
      value: JSON.stringify(authData),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 // 1 hour in seconds
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  // Logout endpoint - clear the auth cookie
  const response = NextResponse.json({ success: true });
  
  response.cookies.set({
    name: 'svix-console-auth',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0 // Expire immediately
  });
  
  return response;
}