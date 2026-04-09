'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFakeLogin = () => {
    setLoading(true);
    // Simulate a brief redirect delay
    setTimeout(() => {
      localStorage.setItem('fake_auth', 'true');
      router.push('/');
    }, 800);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden relative">
              <Image 
                src="/logo.svg" 
                alt="Logo" 
                fill
                className="object-cover"
                sizes="48px"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '🪪';
                    parent.className = "w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl";
                  }
                }}
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">AgentPassport: Token Vault</CardTitle>
          <CardDescription>
            Securely delegate data access to your AI agents via Auth0
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 text-left">
            <p className="font-semibold mb-1">🛡️ Why Auth0 Token Vault?</p>
            <p>Instead of exposing sensitive OAuth keys to AI agents, we use Auth0 to securely manage high-privilege tokens and provide a controlled, scoped gateway.</p>
          </div>
          <Button
            onClick={handleFakeLogin}
            disabled={loading}
            variant="outline"
            className="w-full h-12 text-base font-medium border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <Spinner className="w-5 h-5 text-slate-600" />
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Hackathon Simulation</span>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 max-w-[280px] mx-auto">
            By clicking "Continue with Google", you'll be redirected to the dashboard using simulated authentication.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
