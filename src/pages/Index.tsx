
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, MapPin, Shield, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Car,
      title: "Easy Ride Sharing",
      description: "Find or offer rides with just a few clicks. Connect with people going your way."
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join a verified community of drivers and passengers with ratings and reviews."
    },
    {
      icon: MapPin,
      title: "Smart Matching",
      description: "Advanced location matching to find the most convenient rides for your journey."
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your safety is our priority with verified profiles and secure payments."
    },
    {
      icon: Clock,
      title: "Flexible Timing",
      description: "Choose rides that match your schedule with flexible departure times."
    },
    {
      icon: Star,
      title: "Quality Rides",
      description: "Experience comfortable journeys with our quality-rated vehicles and drivers."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient text-primary-foreground py-20 px-6">
          <div className="container mx-auto text-center relative z-10">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-medium">
              <Car className="w-4 h-4 mr-2" />
              Welcome to the Future of Ride Sharing
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Share the Journey,
              <br />
              <span className="text-yellow-300">Share the Cost</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Connect with fellow travelers, reduce your carbon footprint, and make every journey more affordable and social.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3">
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-3">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the most convenient, safe, and affordable way to share rides with our cutting-edge platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 hover:-translate-y-1">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">10K+</div>
              <div className="text-lg text-muted-foreground">Happy Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">50K+</div>
              <div className="text-lg text-muted-foreground">Rides Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">₹2M+</div>
              <div className="text-lg text-muted-foreground">Money Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <Card className="max-w-4xl mx-auto border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of travelers who have discovered a better way to get around. 
                Sign up today and start sharing rides!
              </p>
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link to="/signup">Join Now - It's Free!</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
