import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    }
    return false;
  };

  return { isInstallable, isInstalled, promptInstall };
};

export const InstallPromptBanner = () => {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  // Check localStorage for dismissed state
  useEffect(() => {
    const wasDismissed = localStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (isInstalled || dismissed || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-4">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="font-medium text-sm">Install MedVault</p>
              <p className="text-xs text-muted-foreground">
                Add to your home screen for quick access and offline viewing
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={promptInstall} className="h-8">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Install
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8">
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InstallPage = () => {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 rounded-2xl overflow-hidden w-20 h-20 shadow-lg">
            <img src="/pwa-192x192.png" alt="MedVault" className="w-full h-full object-cover" />
          </div>
          <CardTitle className="text-2xl">Install MedVault</CardTitle>
          <CardDescription>
            Get quick access to your health records from your home screen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg">Already Installed!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  MedVault is ready on your device. Open it from your home screen.
                </p>
              </div>
            </div>
          ) : isIOS ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                To install on iPhone or iPad:
              </p>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button in Safari (the square with an arrow)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>Add to Home Screen</strong>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    3
                  </span>
                  <span>
                    Tap <strong>Add</strong> in the top right corner
                  </span>
                </li>
              </ol>
            </div>
          ) : isInstallable ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Benefits of installing:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Quick access from your home screen
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Works offline - view cached data anytime
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Faster loading with app-like experience
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    No app store download required
                  </li>
                </ul>
              </div>
              <Button onClick={promptInstall} className="w-full" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Install Now
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                To install this app, open it in a supported browser like Chrome, Edge, or Safari.
              </p>
              <p className="text-xs text-muted-foreground">
                If you're on Android, use Chrome. On iPhone/iPad, use Safari.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPage;
