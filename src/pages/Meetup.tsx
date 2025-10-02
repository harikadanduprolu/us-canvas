import React, { useEffect, useRef } from "react";
import { useCoupleContext } from "@/contexts/CoupleContext";

const MeetUp = () => {
  const { currentUser } = useCoupleContext();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  const APP_ID = import.meta.env.VITE_JITSI_APP_ID; // This will be undefined if not set
  const useJaaS = !!APP_ID; // Determine if we are using JaaS or public server
  const domain = useJaaS ? '8x8.vc' : 'meet.jit.si';
  const scriptSrc = useJaaS ? `https://${domain}/${APP_ID}/external_api.js` : `https://${domain}/external_api.js`;

  useEffect(() => {
    if (!currentUser || !jitsiContainerRef.current) return; // APP_ID is not a direct dependency for useEffect condition anymore

    // Display a console warning if APP_ID is not defined (for user guidance)
    if (!useJaaS) {
      console.warn("JITSI_APP_ID is not defined in environment variables. Falling back to public meet.jit.si. Please add VITE_JITSI_APP_ID=YOUR_APP_ID to your .env.local file and restart the development server for JaaS features.");
    }

    const roomName = useJaaS ? `${APP_ID}/${currentUser.id}-${Date.now()}` : `LuvConnect-${currentUser.id}-${Date.now()}`; // Unique room name per user session

    const script = document.createElement('script');
    script.src = scriptSrc; // Use dynamic scriptSrc
    script.async = true;
    script.onload = () => {
      if (!jitsiContainerRef.current) return;

      const options = {
        roomName: roomName,
        parentNode: jitsiContainerRef.current,
        userInfo: { displayName: currentUser.name },
        interfaceConfigOverwrite: {
          // Hide unnecessary buttons for a cleaner UI
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'fullscreen', 'fodeviceselection',
            'profile', 'chat', 'recording', 'livestreaming', 'etherpad',
            'sharedvideo', 'settings', 'raisehand', 'videoquality', 'filmstrip',
            'feedback', 'stats', 'shortcuts', 'tileview', 'videobgblur', 'hangup',
            'download', 'help', 'mute-everyone', 'security', 'e2ee' // Added hangup button
          ],
          // Optionally hide toolbars on mouse out
          TOOLBAR_AUTO_HIDE_ENABLED: true,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        }
      };

      try {
        const newApi = new (window as any).JitsiMeetExternalAPI(domain, options);
        apiRef.current = newApi;
        console.log("Jitsi API initialized successfully.", newApi);

        newApi.addEventListener('videoConferenceJoined', () => {
          console.log("Video conference joined");
          // You can add event listeners here if needed
        });

        newApi.addEventListener('readyToClose', () => {
          console.log("Ready to close");
          // Handle meeting end, e.g., redirect user
        });

      } catch (error) {
        console.error("Error initializing Jitsi API:", error);
      }
    };

    document.body.appendChild(script);

    return () => {
      console.log("Jitsi API cleanup.");
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      document.body.removeChild(script);
    };
  }, [currentUser, useJaaS]); // Add APP_ID to dependency array

  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">Meet Up</h1>
        <div 
          ref={jitsiContainerRef}
          id="jitsi-container" 
          className="aspect-[16/9] w-full bg-muted rounded-lg overflow-hidden border"
          style={{ height: '600px' }}
        >
          {/* Jitsi Meet will be embedded here via JavaScript */}
          {!currentUser && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Please log in to start a meeting.
            </div>
          )}
          {!currentUser && useJaaS && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              JITSI_APP_ID is set, but you are not logged in. Please log in.
            </div>
          )}
          {currentUser && !useJaaS && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-red-500 font-semibold">
              JITSI_APP_ID is not set. Using public meet.jit.si (5-minute limit for embedded calls). Please check console for instructions.
            </div>
          )}
           {currentUser && useJaaS && !apiRef.current && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Loading Jitsi Meet...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetUp;
