import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Camera, Gamepad2, BookOpen, MessageCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ScribbleGame } from "@/components/ScribbleGame";
import { SharedDiary } from "@/components/SharedDiary";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-sunset">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-romantic opacity-40" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="animate-float">
            <Heart className="h-16 w-16 text-primary-glow mx-auto mb-6 animate-heartbeat" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Stay Connected,
            <span className="text-primary-glow block">Stay in Love</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            A beautiful digital space for couples to share memories, play games, 
            write together, and strengthen their bond every day.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="romantic" size="lg" className="text-lg px-8 py-4">
              <Heart className="mr-2 h-5 w-5" />
              Start Your Journey
            </Button>
            <Button variant="dreamy" size="lg" className="text-lg px-8 py-4">
              <Users className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Floating hearts animation */}
        <div className="absolute inset-0 pointer-events-none">
          <Heart className="absolute top-1/4 left-1/4 h-6 w-6 text-primary-glow/30 animate-float" style={{animationDelay: '0s'}} />
          <Heart className="absolute top-1/3 right-1/4 h-4 w-4 text-primary-glow/20 animate-float" style={{animationDelay: '1s'}} />
          <Heart className="absolute bottom-1/3 left-1/3 h-5 w-5 text-primary-glow/25 animate-float" style={{animationDelay: '2s'}} />
          <Heart className="absolute bottom-1/4 right-1/3 h-7 w-7 text-primary-glow/15 animate-float" style={{animationDelay: '0.5s'}} />
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need to Stay Close
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From shared diaries to fun games, create lasting memories together
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-romantic transition-smooth hover:-translate-y-2">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 group-hover:animate-heartbeat" />
                <CardTitle className="text-2xl">Shared Diary</CardTitle>
                <CardDescription className="text-base">
                  Write your love story together with a beautiful shared journal
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="dreamy" className="w-full">
                  Try Diary
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-romantic transition-smooth hover:-translate-y-2">
              <CardHeader className="text-center">
                <Gamepad2 className="h-12 w-12 text-primary mx-auto mb-4 group-hover:animate-heartbeat" />
                <CardTitle className="text-2xl">Fun Games</CardTitle>
                <CardDescription className="text-base">
                  Play scribble, quizzes, and other games to have fun together
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="dreamy" className="w-full">
                  Play Games
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-romantic transition-smooth hover:-translate-y-2">
              <CardHeader className="text-center">
                <Camera className="h-12 w-12 text-primary mx-auto mb-4 group-hover:animate-heartbeat" />
                <CardTitle className="text-2xl">Memory Gallery</CardTitle>
                <CardDescription className="text-base">
                  Share photos and create a beautiful timeline of your relationship
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="dreamy" className="w-full">
                  Share Memories
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-romantic transition-smooth hover:-translate-y-2">
              <CardHeader className="text-center">
                <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4 group-hover:animate-heartbeat" />
                <CardTitle className="text-2xl">Daily Check-ins</CardTitle>
                <CardDescription className="text-base">
                  Share your mood and feelings with personalized daily prompts
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="dreamy" className="w-full">
                  Check In
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-romantic transition-smooth hover:-translate-y-2">
              <CardHeader className="text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4 group-hover:animate-heartbeat" />
                <CardTitle className="text-2xl">Love Activities</CardTitle>
                <CardDescription className="text-base">
                  Daily challenges and activities to strengthen your connection
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="dreamy" className="w-full">
                  Get Activities
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-romantic transition-smooth hover:-translate-y-2">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4 group-hover:animate-heartbeat" />
                <CardTitle className="text-2xl">Private & Secure</CardTitle>
                <CardDescription className="text-base">
                  Your love story is safe with end-to-end encryption and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="dreamy" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Demos */}
      <section className="py-20 px-6 bg-muted/30">
        <FeaturesSection />
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 text-center bg-gradient-love">
        <div className="max-w-4xl mx-auto">
          <Heart className="h-16 w-16 text-white mx-auto mb-6 animate-heartbeat" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Begin Your Love Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of couples who are staying connected and creating beautiful memories together.
          </p>
          <Button variant="heart" size="lg" className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90">
            <Heart className="mr-2 h-5 w-5" />
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;