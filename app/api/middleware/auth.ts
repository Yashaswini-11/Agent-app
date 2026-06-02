import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { verifyToken } from '@/utils/auth'

export function authMiddleware(handler: Function) {
  return async (request: NextRequest) => {
    try {
      const token = getTokenFromHeader(request)
      if (!token) {
        return Response.json(
          { error: 'Access token required' },
          { status: 401 }
        )
      }
      const decoded = verifyToken(token) as {
        userId: string
        email: string
        iat?: number
        exp?: number
      }
      const modifiedRequest = new NextRequest(request, {
        headers: new Headers(request.headers)
      })
      
      modifiedRequest.headers.set('x-user-id', decoded.userId)
      modifiedRequest.headers.set('x-user-email', decoded.email)

      return handler(modifiedRequest)

    } catch (error) {
      console.error('JWT verification failed:', error)
      
      if (error instanceof jwt.JsonWebTokenError) {
        return Response.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        return Response.json(
          { error: 'Token expired' },
          { status: 401 }
        )
      }

      return Response.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

function getTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  return authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : null
}

export class AuthMiddleware {
  static verifyToken(handler: Function) {
    return async (request: NextRequest) => {
      return authMiddleware(handler)(request)
    }
  }

  static optionalAuth(handler: Function) {
    return async (request: NextRequest) => {
      try {
        const token = getTokenFromHeader(request)
        
        if (token) {
          const decoded = verifyToken(token) as {
            userId: string
            email: string
          }
          const modifiedRequest = new NextRequest(request, {
            headers: new Headers(request.headers)
          })
          modifiedRequest.headers.set('x-user-id', decoded.userId)
          modifiedRequest.headers.set('x-user-email', decoded.email)
          
          return handler(modifiedRequest)
        }
      } catch (error) {
        console.warn('Optional auth failed, continuing without user data')
      }
      
      return handler(request)
    }
  }
}