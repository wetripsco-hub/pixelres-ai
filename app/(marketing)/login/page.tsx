"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createClient();

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-50 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dzvy8pbbm/image/upload/v1709668478/grid-pattern_q5m9i2.svg')] bg-repeat opacity-[0.03]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="h-full w-full bg-[#090A0F] rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-100">
              PixelRes <span className="text-cyan-400">AI</span>
            </span>
          </Link>
        </div>

        <Card className="bg-slate-900/40 border-slate-800/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-slate-100">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in or create an account to start upscaling
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#06b6d4', // cyan-500
                      brandAccent: '#0891b2', // cyan-600
                      brandButtonText: 'white',
                      defaultButtonBackground: '#1e293b', // slate-800
                      defaultButtonBackgroundHover: '#334155', // slate-700
                      defaultButtonBorder: '#334155', // slate-700
                      defaultButtonText: 'white',
                      dividerBackground: '#334155', // slate-700
                      inputBackground: '#0f172a', // slate-900
                      inputBorder: '#334155', // slate-700
                      inputBorderHover: '#06b6d4', // cyan-500
                      inputBorderFocus: '#06b6d4', // cyan-500
                      inputText: 'white',
                      inputPlaceholder: '#94a3b8', // slate-400
                      messageText: '#ef4444', // red-500
                      messageTextDanger: '#ef4444', // red-500
                      anchorTextColor: '#06b6d4', // cyan-500
                      anchorTextHoverColor: '#67e8f9', // cyan-300
                    },
                    space: {
                      buttonPadding: '12px 16px',
                      inputPadding: '12px 16px',
                    },
                    radii: {
                      borderRadiusButton: '0.5rem',
                      buttonBorderRadius: '0.5rem',
                      inputBorderRadius: '0.5rem',
                    },
                  },
                },
                className: {
                  container: 'w-full',
                  button: 'w-full font-medium transition-all shadow-md',
                  input: 'transition-colors',
                  label: 'text-slate-300 font-medium mb-1.5',
                  loader: 'animate-spin',
                  message: 'text-sm text-center mt-4 p-3 rounded-md bg-slate-800/50 border border-slate-700',
                  anchor: 'text-sm font-medium transition-colors hover:underline',
                  divider: 'my-6',
                },
              }}
              theme="dark"
              providers={['google']}
              redirectTo={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`}
              onlyThirdPartyProviders={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
