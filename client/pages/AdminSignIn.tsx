import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SigninRequest, AuthResponse } from "@shared/api";

export default function AdminSignIn() {
  const [email, setEmail] = useState("admin@venuebook.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const requestData: SigninRequest = { email, password };

      console.log("Making admin signin request to:", "/api/auth/admin/signin");
      console.log("Request data:", { email: requestData.email, password: "***" });

      const response = await fetch("/api/auth/admin/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
          console.log("Error data:", errorData);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          console.log("Raw response:", responseText);
        }
        throw new Error(errorMessage);
      }

      const authData: AuthResponse = JSON.parse(responseText);
      console.log("Successful admin signin:", { userId: authData.user.id, isAdmin: authData.user.isAdmin });

      // Verify admin role
      if (!authData.user.isAdmin) {
        throw new Error("Access denied: Admin privileges required");
      }

      // Store token in localStorage
      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData.user));

      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin dashboard.",
      });

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin sign in error:", error);

      let errorMessage = "Please check your admin credentials.";
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Network connection failed. Please check your connection and try again.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Admin Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="w-full px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-7 w-7 sm:h-8 sm:w-8" style={{color: '#C94E5D'}} />
            <span className="text-xl sm:text-2xl font-bold text-foreground">Flow</span>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1 sm:gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Sign In</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-12">
        <div className="w-full max-w-sm sm:max-w-md">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4 px-4 sm:px-6">
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3" style={{backgroundColor: '#C94E5D20'}}>
                <Shield className="h-5 w-5 sm:h-6 sm:w-6" style={{color: '#C94E5D'}} />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Admin Portal</CardTitle>
              <CardDescription className="text-sm">
                Secure venue management access
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-sm font-medium">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@venuebook.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-sm font-medium">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Access Dashboard"}
                </Button>
              </form>

              <div className="mt-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Restricted to authorized administrators only
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-6 py-4 text-center text-sm text-muted-foreground">
        © 2024 Flow. Streamlining space reservations.
      </footer>
    </div>
  );
}
