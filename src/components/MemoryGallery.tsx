import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Heart, Calendar, MapPin, Plus, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCoupleContext } from "@/contexts/CoupleContext";
import { getPhotos, savePhoto, Photo } from "@/lib/storage";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  tags: string[];
  imageUrl: string;
  uploadedBy: "You" | "Partner";
}

export const MemoryGallery = () => {
  const { couple, currentUser } = useCoupleContext();
  const [memories, setMemories] = useState<Memory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newMemory, setNewMemory] = useState({
    title: "",
    description: "",
    location: "",
    tags: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Load photos from database
  useEffect(() => {
    const loadPhotos = async () => {
      if (!couple?.id) return;
      
      try {
        setIsLoading(true);
        const dbPhotos = await getPhotos(couple.id);
        
        // Convert database photos to component format
        const formattedMemories: Memory[] = dbPhotos.map((photo: Photo) => {
          // Parse caption for structured data
          const captionLines = photo.caption.split('\n');
          const title = captionLines[0] || "Untitled Memory";
          let description = captionLines[1] || "";
          let location = "";
          let tags: string[] = [];
          
          // Extract location and tags from caption
          captionLines.forEach(line => {
            if (line.startsWith('Location: ')) {
              location = line.replace('Location: ', '');
            } else if (line.startsWith('Tags: ')) {
              tags = line.replace('Tags: ', '').split(',').map(t => t.trim()).filter(Boolean);
            } else if (line && line !== title) {
              description = line;
            }
          });

          return {
            id: photo.id,
            title,
            description,
            date: photo.createdAt.split('T')[0],
            location,
            tags,
            imageUrl: photo.data, // Cloudinary URL or base64
            uploadedBy: photo.uploaderId === currentUser?.id ? "You" : "Partner"
          };
        });
        
        setMemories(formattedMemories);
      } catch (error) {
        console.error('Error loading photos:', error);
        toast("Failed to load memories");
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotos();
  }, [couple?.id, currentUser?.id]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast("Image must be smaller than 5MB");
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      // Directly handle the file without creating a mock event
      if (imageFile.type.startsWith('image/') && imageFile.size <= 5 * 1024 * 1024) {
        setSelectedFile(imageFile);
        const url = URL.createObjectURL(imageFile);
        setPreviewUrl(url);
      } else if (!imageFile.type.startsWith('image/')) {
        toast("Please drop an image file");
      } else {
        toast("Image must be smaller than 5MB");
      }
    } else {
      toast("Please drop an image file");
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Clear selected image
  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addMemory = async () => {
    if (!newMemory.title.trim()) {
      toast("Please add a title for your memory!");
      return;
    }

    if (!selectedFile) {
      toast("Please select an image to upload!");
      return;
    }

    if (!couple?.id || !currentUser?.id) {
      toast("Please log in to add memories");
      return;
    }

    try {
      setIsUploading(true);
      console.log("Starting memory upload...");
      
      // Upload to Cloudinary
      let imageUrl: string;
      let cloudinaryPublicId: string | undefined;
      
      try {
        console.log("Uploading to Cloudinary...");
        const uploadResult = await uploadToCloudinary(selectedFile, 'couple-memories');
        imageUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
        console.log("Cloudinary upload successful:", { imageUrl, cloudinaryPublicId });
        toast("Image uploaded successfully!");
      } catch (cloudinaryError) {
        console.warn("Cloudinary upload failed, using base64 fallback:", cloudinaryError);
        // Fallback to base64 if Cloudinary fails
        const reader = new FileReader();
        imageUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
        toast("Using local image (Cloudinary unavailable)");
      }
      
      // Create photo record
      const dbPhoto: Photo = {
        id: crypto.randomUUID(),
        coupleId: couple.id,
        uploaderId: currentUser.id,
        uploaderName: currentUser.name,
        data: imageUrl,
        caption: `${newMemory.title}\n${newMemory.description}\nLocation: ${newMemory.location}\nTags: ${newMemory.tags}`,
        createdAt: new Date().toISOString(),
        cloudinaryPublicId,
      };

      console.log("Saving photo to database:", dbPhoto);
      await savePhoto(dbPhoto);

      const newMemoryEntry: Memory = {
        id: dbPhoto.id,
        title: newMemory.title,
        description: newMemory.description,
        date: new Date().toISOString().split("T")[0],
        location: newMemory.location,
        tags: newMemory.tags ? newMemory.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
        imageUrl: imageUrl,
        uploadedBy: "You",
      };

      setMemories([newMemoryEntry, ...memories]);
      
      // Reset form
      setNewMemory({ title: "", description: "", location: "", tags: "" });
      clearSelectedFile();
      
      toast("Memory added successfully! 📸💕");
    } catch (error) {
      console.error('Error saving memory:', error);
      toast("Failed to save memory. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const tagColors = [
    "bg-pink-100 text-pink-800 border-pink-200",
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-green-100 text-green-800 border-green-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-orange-100 text-orange-800 border-orange-200",
  ];

  return (
    <div className="space-y-6">
      {/* Upload New Memory */}
      <Card className="bg-gradient-dreamy shadow-gentle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Add a New Memory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              selectedFile 
                ? 'border-green-300 bg-green-50' 
                : 'border-border hover:border-primary'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full max-h-40 rounded-lg shadow-md"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 rounded-full h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelectedFile();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-green-600 font-medium">
                  {selectedFile?.name} selected
                </p>
                <p className="text-xs text-muted-foreground">
                  Click to change image
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Click to upload a photo</p>
                <p className="text-sm text-muted-foreground">
                  Or drag and drop your image here
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports JPG, PNG, GIF up to 5MB
                </p>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Memory title"
              value={newMemory.title}
              onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={newMemory.location}
              onChange={(e) => setNewMemory({ ...newMemory, location: e.target.value })}
            />
          </div>
          
          <Textarea
            placeholder="Description of this special moment..."
            value={newMemory.description}
            onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
            rows={3}
          />
          
          <Input
            placeholder="Tags (separate with commas)"
            value={newMemory.tags}
            onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
          />
          
          <Button 
            onClick={addMemory} 
            className="w-full" 
            variant="romantic" 
            disabled={isUploading || !selectedFile || !newMemory.title.trim()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading Memory...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Memory
              </>
            )}
            {isLoading ? "Adding..." : "Add Memory"}
          </Button>
        </CardContent>
      </Card>

      {/* Memory Grid */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Heart className="h-6 w-6" />
          Your Beautiful Memories
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory, index) => (
            <Card key={memory.id} className="group hover:shadow-romantic transition-smooth hover:-translate-y-1 overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img
                  src={memory.imageUrl}
                  alt={memory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <h4 className="font-semibold text-lg">{memory.title}</h4>
                  <p className="text-sm text-muted-foreground">{memory.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(memory.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {memory.location}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {memory.tags.map((tag, tagIndex) => (
                    <Badge
                      key={tag}
                      className={`text-xs ${tagColors[tagIndex % tagColors.length]}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Uploaded by {memory.uploadedBy}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center py-8">
        <p className="text-muted-foreground">
          📸 Every moment with you is worth remembering 📸
        </p>
      </div>
    </div>
  );
};