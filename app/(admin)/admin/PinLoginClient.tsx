"use client";

import React, { useState } from "react";
import { verifyPin } from "./actions";
import { Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PinLoginClient() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await verifyPin(pin);
      if (!res.success) {
        setError(res.error || "Invalid PIN");
      }
      // If success, the page will revalidate and show the dashboard
    } catch (err: any) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-violet-500" />
          </div>
          <CardTitle className="text-2xl text-slate-100">Admin Access</CardTitle>
          <CardDescription className="text-slate-400">
            Enter the admin PIN to access the command center.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
               <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                 {error}
               </div>
            )}
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="pl-10 bg-slate-950 border-slate-800 text-slate-100"
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || !pin} className="w-full bg-violet-600 hover:bg-violet-500 text-white">
              {loading ? "Verifying..." : "Unlock Dashboard"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
