// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { getDatabaseConfigMessage, isPrismaConnectionError } from './database-error';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const authSecret = process.env.NEXTAUTH_SECRET || 'roots-of-country-dev-secret';

export const authOptions: NextAuthOptions = {
  ...(hasDatabaseUrl ? { adapter: PrismaAdapter(prisma) } : {}),
  secret: authSecret,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        if (!hasDatabaseUrl) {
          throw new Error(getDatabaseConfigMessage());
        }

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
        } catch (error) {
          if (isPrismaConnectionError(error)) {
            throw new Error(getDatabaseConfigMessage());
          }

          throw error;
        }

        if (!user || !user.password) {
          throw new Error('No account found with this email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Incorrect password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
