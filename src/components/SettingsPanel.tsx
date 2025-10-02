import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Shield, Palette, Users } from "lucide-react";

export const SettingsPanel = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-gentle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-reminders">Daily activity reminders</Label>
            <Switch id="daily-reminders" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="message-notifications">Message notifications</Label>
            <Switch id="message-notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-gentle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Partner Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner-email">Partner's Email</Label>
            <Input 
              id="partner-email" 
              type="email" 
              placeholder="partner@example.com"
              defaultValue="partner@example.com"
            />
          </div>
          <Button variant="dreamy" className="w-full">
            Update Connection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};