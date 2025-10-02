import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Check, X, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { savePhoto, Photo } from "@/lib/storage";
import { useCoupleContext } from "@/contexts/CoupleContext";

export const ImageUploadTester = () => {
  const { couple, currentUser } = useCoupleContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    cloudinaryUrl?: string;
    cloudinaryPublicId?: string;
    databaseSaved?: boolean;
    error?: string;
  }>({});

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast("Image must be smaller than 5MB");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUploadResults({}); // Clear previous results
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadResults({});
  };

  const testImageUpload = async () => {
    if (!selectedFile) {
      toast("Please select an image first");
      return;
    }

    if (!couple?.id || !currentUser?.id) {
      toast("Please log in with a couple account to test uploads");
      return;
    }

    setIsUploading(true);
    const results: typeof uploadResults = {};

    try {
      // Step 1: Test Cloudinary upload
      console.log("🚀 Testing Cloudinary upload...");
      toast("Uploading to Cloudinary...");
      
      try {
        const cloudinaryResult = await uploadToCloudinary(selectedFile, 'test-uploads');
        results.cloudinaryUrl = cloudinaryResult.secure_url;
        results.cloudinaryPublicId = cloudinaryResult.public_id;
        
        console.log("✅ Cloudinary upload successful:", cloudinaryResult);
        toast("✅ Cloudinary upload successful!");
      } catch (cloudinaryError: any) {
        console.error("❌ Cloudinary upload failed:", cloudinaryError);
        results.error = `Cloudinary: ${cloudinaryError.message}`;
        toast("❌ Cloudinary upload failed - see console");
      }

      // Step 2: Test database save (with Cloudinary URL if available, or base64 fallback)
      console.log("💾 Testing database save...");
      toast("Saving to database...");

      let imageData = results.cloudinaryUrl;
      if (!imageData) {
        // Fallback to base64 if Cloudinary failed
        const reader = new FileReader();
        imageData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      const testPhoto: Photo = {
        id: crypto.randomUUID(),
        coupleId: couple.id,
        uploaderId: currentUser.id,
        uploaderName: currentUser.name,
        data: imageData,
        caption: `Test Upload - ${selectedFile.name}\\nUploaded at: ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        cloudinaryPublicId: results.cloudinaryPublicId,
      };

      try {
        console.log("Saving photo to database:", testPhoto);
        await savePhoto(testPhoto);
        results.databaseSaved = true;
        console.log("✅ Database save successful");
        toast("✅ Database save successful!");
      } catch (dbError: any) {
        console.error("❌ Database save failed:", dbError);
        results.error = (results.error ? results.error + "; " : "") + `Database: ${dbError.message}`;
        toast("❌ Database save failed - see console");
      }

    } catch (error: any) {
      console.error("❌ Upload test failed:", error);
      results.error = error.message;
    } finally {
      setUploadResults(results);
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Image Upload Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Authentication Status */}
        <div className="flex items-center gap-2">
          <Badge variant={currentUser && couple ? "default" : "secondary"}>
            {currentUser && couple ? "Ready to Upload" : "Login Required"}
          </Badge>
          {currentUser && couple && (
            <span className="text-sm text-muted-foreground">
              Logged in as {currentUser.name} in couple "{couple.name}"
            </span>
          )}
        </div>

        {/* File Selection */}
        <div 
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
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
                    clearFile();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div>
                <p className="font-medium">{selectedFile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile?.size || 0 / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Click to select test image</p>
              <p className="text-sm text-muted-foreground">JPG, PNG, GIF up to 5MB</p>
            </>
          )}
        </div>

        {/* Test Button */}
        <Button
          onClick={testImageUpload}
          disabled={!selectedFile || isUploading || !currentUser || !couple}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing Upload...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Test Image Upload
            </>
          )}
        </Button>

        {/* Results */}
        {(uploadResults.cloudinaryUrl || uploadResults.error || uploadResults.databaseSaved !== undefined) && (
          <Alert>
            <AlertDescription>
              <div className="space-y-3">
                <h4 className="font-semibold">Upload Test Results:</h4>
                
                {/* Cloudinary Results */}
                <div className="flex items-center gap-2">
                  {uploadResults.cloudinaryUrl ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Cloudinary Upload: ✅ Success</span>
                    </>
                  ) : uploadResults.error?.includes('Cloudinary') ? (
                    <>
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Cloudinary Upload: ❌ Failed</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Cloudinary: Pending...</span>
                  )}
                </div>

                {uploadResults.cloudinaryUrl && (
                  <div className="ml-6">
                    <a 
                      href={uploadResults.cloudinaryUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View uploaded image <ExternalLink className="h-3 w-3" />
                    </a>
                    <p className="text-xs text-muted-foreground">
                      Public ID: {uploadResults.cloudinaryPublicId}
                    </p>
                  </div>
                )}

                {/* Database Results */}
                <div className="flex items-center gap-2">
                  {uploadResults.databaseSaved === true ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Database Save: ✅ Success</span>
                    </>
                  ) : uploadResults.databaseSaved === false ? (
                    <>
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Database Save: ❌ Failed</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Database: Pending...</span>
                  )}
                </div>

                {/* Error Messages */}
                {uploadResults.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                    <p className="text-sm text-red-700 font-medium">Errors:</p>
                    <p className="text-sm text-red-600">{uploadResults.error}</p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Alert>
          <AlertDescription>
            <div className="text-sm space-y-2">
              <p><strong>How to test:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Make sure you're logged in (use test login in User Diagnostic above)</li>
                <li>Select an image file (JPG, PNG, GIF under 5MB)</li>
                <li>Click "Test Image Upload" to test the full pipeline</li>
                <li>Check console (F12) for detailed logs</li>
                <li>Verify results show both Cloudinary and database success</li>
              </ol>
              <p className="mt-3 text-muted-foreground">
                This tests the complete image upload flow: Cloudinary upload → database save with URL
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
