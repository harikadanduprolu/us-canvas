import { useEffect, useState } from 'react';
import { useCoupleContext } from '@/contexts/CoupleContext';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface ProfileForm {
  name: string;
  username: string;
  dob: string;
  avatar_url: string;
  hobbies: string;
  likes: string;
  dislikes: string;
  description: string;
}

export function UserProfileEditor() {
  const { currentUser } = useCoupleContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    username: '',
    dob: '',
    avatar_url: '',
    hobbies: '',
    likes: '',
    dislikes: '',
    description: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!currentUser || !hasSupabaseConfig) return;
      const { data, error } = await (supabase as any)
        .from('users')
        .select('name,username,dob,avatar_url,hobbies,likes,dislikes,description')
        .eq('id', currentUser.id)
        .limit(1);
      if (error) return;
      const u = data && data[0];
      if (!u) return;
      setForm({
        name: u.name || '',
        username: u.username || '',
        dob: u.dob || '',
        avatar_url: u.avatar_url || '',
        hobbies: (u.hobbies || []).join(', '),
        likes: (u.likes || []).join(', '),
        dislikes: (u.dislikes || []).join(', '),
        description: u.description || '',
      });
    };
    load();
  }, [currentUser]);

  const updateField = (key: keyof ProfileForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const res = await uploadToCloudinary(file, 'us-canvas/avatars');
      updateField('avatar_url', res.secure_url);
      toast({ title: 'Avatar uploaded' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser || !hasSupabaseConfig) return;
    try {
      setLoading(true);
      const payload = {
        name: form.name || null,
        username: form.username || null,
        dob: form.dob || null,
        avatar_url: form.avatar_url || null,
        hobbies: form.hobbies ? form.hobbies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        likes: form.likes ? form.likes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        dislikes: form.dislikes ? form.dislikes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        description: form.description || null,
      };
      const { error } = await (supabase as any)
        .from('users')
        .update(payload)
        .eq('id', currentUser.id);
      if (error) throw error;
      toast({ title: 'Profile saved' });
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const initial = (currentUser?.name || 'U').slice(0, 1).toUpperCase();

  return (
    <Card className="shadow-gentle">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {form.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.avatar_url} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <AvatarFallback>{initial}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <Label htmlFor="avatar">Profile picture</Label>
            <Input id="avatar" type="file" accept="image/*" onChange={handleUpload} disabled={loading} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={form.username} onChange={(e) => updateField('username', e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dob">Date of birth</Label>
            <Input id="dob" type="date" value={form.dob} onChange={(e) => updateField('dob', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="hobbies">Hobbies (comma separated)</Label>
            <Input id="hobbies" value={form.hobbies} onChange={(e) => updateField('hobbies', e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="likes">Likes (comma separated)</Label>
            <Input id="likes" value={form.likes} onChange={(e) => updateField('likes', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="dislikes">Dislikes (comma separated)</Label>
            <Input id="dislikes" value={form.dislikes} onChange={(e) => updateField('dislikes', e.target.value)} />
          </div>
        </div>

        <div>
          <Label htmlFor="description">About you</Label>
          <Textarea id="description" rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
        </div>

        <Button onClick={handleSave} disabled={loading}>Save</Button>
      </CardContent>
    </Card>
  );
}

