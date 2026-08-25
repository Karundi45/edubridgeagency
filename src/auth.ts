import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { connectToDatabase } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import StudentProfile from '@/lib/db/models/StudentProfile';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(1).trim(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Authorize called with email:', credentials?.email);
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.log('Validation failed:', parsed.error);
          return null;
        }

        await connectToDatabase();
        const emailToFind = parsed.data.email.toLowerCase();

        const user = await User.findOne({ email: emailToFind }).select('+passwordHash');
        if (!user) {
          console.log('User not found for email:', parsed.data.email);
          return null;
        }
        if (!user.passwordHash) {
          console.log('User has no password hash:', parsed.data.email);
          return null;
        }

        if (user.suspended) {
          console.log('User is suspended');
          throw new Error('Account suspended. Please contact support.');
        }

        const isValid = await user.comparePassword(parsed.data.password);
        if (!isValid) {
          console.log('Password comparison failed for:', parsed.data.email);
          return null;
        }

        console.log('Login successful for:', user.email);
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in: create user if not exists
      if (account?.provider === 'google' && user.email) {
        try {
          await connectToDatabase();
          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            // Create new user from Google auth
            dbUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: 'student',
              emailVerified: true,
            });
            // Create student profile
            await StudentProfile.create({ userId: dbUser._id });
          }

          if (dbUser.suspended) {
            return false;
          }

          // Attach role and id to user object for JWT
          user.id = dbUser._id.toString();
          (user as Record<string, unknown>).role = dbUser.role;
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as Record<string, unknown>).role as string;
      }

      // Refresh role from DB on each sign-in (not every request, only on initial)
      if (token.id && !token.role) {
        try {
          await connectToDatabase();
          const dbUser = await User.findById(token.id);
          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch {
          // Silent fail
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// Extend session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
  interface User {
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
  }
}
