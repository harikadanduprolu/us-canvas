import { SettingsPanel } from "@/components/SettingsPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon, Shield, Bell, Palette, Users } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-romantic p-4 rounded-full shadow-romantic">
              <SettingsIcon className="h-8 w-8 text-white animate-heartbeat" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Settings
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Customize your experience and manage your preferences for the perfect romantic journey.
          </p>
        </div>

        {/* Quick Settings Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth cursor-pointer">
            <CardContent className="pt-4">
              <Shield className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-foreground">Privacy</div>
              <p className="text-xs text-muted-foreground">Secure</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth cursor-pointer">
            <CardContent className="pt-4">
              <Bell className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-sm font-medium text-foreground">Notifications</div>
              <p className="text-xs text-muted-foreground">On</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth cursor-pointer">
            <CardContent className="pt-4">
              <Palette className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-foreground">Theme</div>
              <p className="text-xs text-muted-foreground">Romantic</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-gentle hover:shadow-romantic transition-smooth cursor-pointer">
            <CardContent className="pt-4">
              <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-foreground">Partner</div>
              <p className="text-xs text-muted-foreground">Connected</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Settings Panel */}
        <SettingsPanel />
      </div>
    </div>
  );
};

export default Settings;