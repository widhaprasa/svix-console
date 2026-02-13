import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        { error: 'Admin credentials not configured' },
        { status: 500 }
      );
    }
    
    // Verify credentials
    if (username === adminUsername && password === adminPassword) {
      // Create auth token (expires in 1 hour)
      const expiresAt = Date.now() + (60 * 60 * 1000);
      const authData = {
        authenticated: true,
        username,
        expiresAt
      };
      
      const response = NextResponse.json({ success: true });
      
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
    } else {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
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