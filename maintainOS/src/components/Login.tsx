import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";


interface LoginProps {
  onLogin: (user: { name: string; email: string; avatar?: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app you'd validate credentials
    onLogin({
      name: "Ashwini Chauhan",
      email: email || "ashwini@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face"
    });
  };

  const handleDemoLogin = () => {
    onLogin({
      name: "Ashwini Chauhan", 
      email: "ashwini@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b524?w=40&h=40&fit=crop&crop=face"
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
          </div>
          <CardTitle>MaintainOS</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleDemoLogin}>
              Continue with Demo Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}