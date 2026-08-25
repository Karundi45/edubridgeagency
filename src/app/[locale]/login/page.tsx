'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validation/schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        if (res.error.includes('suspended')) {
          setError(t('errors.suspended'));
        } else {
          setError(t('errors.invalid'));
        }
        setIsLoading(false);
      } else {
        toast.success('Logged in successfully!');
        router.push(callbackUrl);
        router.refresh(); // Important to refresh layout state
      }
    } catch (err) {
      setError(t('errors.generic'));
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-alt">
      
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 bg-hero-gradient items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="max-w-md relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 hover:opacity-90 transition-opacity">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <span className="text-2xl font-bold">EduBridge Agency</span>
          </Link>
          <h1 className="text-4xl font-bold mb-6 leading-tight">Welcome back to your educational journey.</h1>
          <p className="text-blue-100 text-lg">
            Access your personalized scholarship matches, application tracker, and AI assistant.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-text">EduBridge</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
            <h2 className="text-2xl font-bold text-text mb-2">{t('title')}</h2>
            <p className="text-text-muted mb-8">{t('subtitle')}</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-danger text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                handleSubmit(onSubmit)(e); 
              }} 
              method="POST"
              className="space-y-4"
            >
              <Input
                label={t('email')}
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
              
              <div>
                <Input
                  label={t('password')}
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <button type="submit" disabled={isLoading} className="w-full mt-2 bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center">
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                ) : null}
                {t('submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
