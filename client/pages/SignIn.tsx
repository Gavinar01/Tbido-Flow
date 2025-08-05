import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, Users } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement actual authentication
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="w-full px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          <span className="text-xl sm:text-2xl font-bold text-foreground">VenueBook</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full max-w-sm mx-auto sm:max-w-md">

          {/* Mobile-first Branding */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3">
              Book Your Perfect
              <span className="text-primary block">Venue Space</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Reserve meeting rooms and event spaces instantly
            </p>

            {/* Compact Features for Mobile */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground">8AM-5PM</p>
              </div>

              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground">Max 20</p>
              </div>

              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground">Instant</p>
              </div>
            </div>
          </div>

          {/* Sign In Form */}
          <div className="w-full">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-3 px-4 sm:px-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription className="text-sm">
                  Sign in to start booking venues
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
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
                    {isLoading ? "Signing In..." : "Enter"}
                  </Button>
                </form>

                <div className="mt-6 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-card px-4 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link to="/admin/signin">
                      <Button
                        variant="outline"
                        className="w-full h-12 text-base font-semibold border-2"
                      >
                        Admin Sign In
                      </Button>
                    </Link>

                    <Link to="/signup">
                      <Button
                        variant="ghost"
                        className="w-full h-12 text-base font-semibold"
                      >
                        Create Account
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-4 py-3 text-center text-xs sm:text-sm text-muted-foreground">
        © 2024 VenueBook
      </footer>
    </div>
  );
}
