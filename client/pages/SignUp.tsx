import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowLeft, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SignupRequest, AuthResponse } from "@shared/api";

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const requestData: SignupRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        organization: formData.organization || undefined,
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const authData: AuthResponse = await response.json();

      // Store token in localStorage
      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData.user));

      toast({
        title: "Account Created!",
        description: "Welcome to Flow. You can now make reservations.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign Up Failed",
        description: error instanceof Error ? error.message : "Please check your information and try again.",
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
            <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
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
              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Create Account</CardTitle>
              <CardDescription className="text-sm">
                Join Flow to start reserving spaces
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-sm font-medium">Organization (Optional)</Label>
                  <Input
                    id="organization"
                    name="organization"
                    type="text"
                    placeholder="Your company"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/" className="text-primary font-semibold hover:underline">
                    Sign in here
                  </Link>
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
