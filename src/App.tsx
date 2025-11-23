import { useState, useEffect } from "react";
import { Search, Bell, User, Play, Upload, CheckCircle } from "lucide-react";
import { api } from "./services/api";
import { Video as VideoType, Creator, User as UserType, DashboardStats } from "./types";
import { Button } from "./components/Button";
import { HomeView } from "./views/HomeView";
import { VideoPlayerView } from "./views/VideoPlayerView";
import { CreatorProfileView } from "./views/CreatorProfileView";
import { CreatorDashboardView } from "./views/CreatorDashboardView";
import { UserProfileView } from "./views/UserProfileView";
import { CreateCreatorView } from "./views/CreateCreatorView";
import { ConnectWalletView } from "./views/ConnectWalletView";
import { useCurrentAccount } from "@mysten/dapp-kit";

// --- Main Application Component ---

export default function VideoPlatformPrototype() {
  // --- State Management ---
  const [currentView, setCurrentView] = useState("home"); // home, video, creator, dashboard, profile
  const [isLoading, setIsLoading] = useState(false);

  // Data State
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoType | null>(null);
  const [activeCreator, setActiveCreator] = useState<Creator | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // UI State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showUploadToast, setShowUploadToast] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const currentAccount = useCurrentAccount();
  const isWalletConnected = Boolean(currentAccount?.address);

  // --- Initial Load ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const [videosData, userData] = await Promise.all([api.getVideos(), api.getCurrentUser()]);
        setVideos(videosData);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // --- Navigation Handlers ---
  const goHome = async () => {
    setIsLoading(true);
    const vids = await api.getVideos();
    setVideos(vids);
    setCurrentView("home");
    setIsLoading(false);
  };

  const goToVideo = async (videoPreview: any) => {
    setIsLoading(true);
    try {
      const fullVideo = await api.getVideoById(videoPreview.id);
      if (fullVideo) {
        setActiveVideo(fullVideo);
        // In a real app, we might fetch this status from the backend specifically
        setCurrentView("video");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const goToCreator = async (creatorName: string | any) => {
    // Handle event object if passed directly
    const name = typeof creatorName === "string" ? creatorName : "Sophie Tech";

    setIsLoading(true);
    try {
      const creator = await api.getCreator(name);
      setActiveCreator(creator);
      // Check subscription status
      setIsSubscribed(currentUser?.subscribedCreatorIds.includes(creator.id) || false);
      setCurrentView("creator");
    } finally {
      setIsLoading(false);
    }
  };

  const goToDashboard = async () => {
    setIsLoading(true);
    const stats = await api.getCreatorDashboard();
    setDashboardStats(stats);
    setCurrentView("dashboard");
    setIsLoading(false);
  };

  const goToProfile = async () => {
    setIsLoading(true);
    const user = await api.getCurrentUser();
    setCurrentUser(user);
    setCurrentView("profile");
    setIsLoading(false);
  };

  const goToCreateCreator = () => {
    setCurrentView("createCreator");
  };

  const handleUnlock = async () => {
    if (activeVideo && currentUser) {
      setIsUnlocking(true);
      try {
        await api.unlockVideo(activeVideo.id);
        // Update local state
        const updatedUser = {
          ...currentUser,
          unlockedVideoIds: [...currentUser.unlockedVideoIds, activeVideo.id],
        };
        setCurrentUser(updatedUser);
        // Refresh video to get stream URL (simulated)
        const refreshedVideo = await api.getVideoById(activeVideo.id);
        if (refreshedVideo) setActiveVideo(refreshedVideo);
      } finally {
        setIsUnlocking(false);
      }
    }
  };

  const handleSubscribe = async () => {
    if (activeCreator) {
      setIsLoading(true);
      await api.subscribeToCreator(activeCreator.id);
      setIsSubscribed(true);
      setIsLoading(false);
    }
  };

  const handleUpload = async (payload: { title: string; description: string; blobId: string; creatorId: string; fileName: string | null }) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("blobId", payload.blobId);
    formData.append("creatorId", payload.creatorId);
    if (payload.fileName) {
      formData.append("fileName", payload.fileName);
    }

    await api.uploadVideo(formData);

    setShowUploadToast(true);
    setIsLoading(false);
    setTimeout(() => setShowUploadToast(false), 3000);
  };

  // --- Mock Data Helpers ---
  // Note: In a real app this would be dynamic. Here we define specific items for the demo.

  if (!isWalletConnected) {
    return <ConnectWalletView />;
  }

  return (
    <div className="min-h-screen pb-20 font-sans bg-slate-50 text-slate-900">
      {/* --- Top Navigation Bar --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
                <Play className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">OpenStream</span>
            </div>

            {/* Desktop Nav */}
            <nav className="items-center hidden gap-6 text-sm font-medium md:flex text-slate-600">
              <button onClick={goHome} className={`hover:text-indigo-600 transition-colors ${currentView === "home" ? "text-indigo-600" : ""}`}>
                Découvrir
              </button>
              <button onClick={goToCreator} className="transition-colors opacity-50 cursor-not-allowed hover:text-indigo-600" title="Demo only">
                Créateurs
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 hidden max-w-md mx-6 md:flex">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher une vidéo, un créateur..."
                className="w-full h-10 pl-10 pr-4 text-sm transition-all border-none rounded-full outline-none bg-slate-100 focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:flex" onClick={goToDashboard}>
              <Upload className="w-4 h-4 mr-2" />
              Créer
            </Button>
            <Button variant="ghost" className="hidden sm:flex" onClick={goToCreateCreator}>
              <User className="w-4 h-4 mr-2" />
              Compte Créateur
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Bell className="w-5 h-5 text-slate-600" />
            </Button>
            <div
              className="flex items-center justify-center transition-all bg-indigo-100 border border-indigo-200 rounded-full cursor-pointer h-9 w-9 hover:ring-2 hover:ring-indigo-500"
              onClick={goToProfile}
            >
              <User className="w-5 h-5 text-indigo-700" />
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="container px-4 py-8 mx-auto">
        {/* VIEW: HOME */}
        {currentView === "home" && <HomeView videos={videos} isLoading={isLoading} goToVideo={goToVideo} />}

        {/* VIEW: VIDEO PLAYER */}
        {currentView === "video" && activeVideo && (
          <VideoPlayerView
            activeVideo={activeVideo}
            currentUser={currentUser}
            isSubscribed={isSubscribed}
            isUnlocking={isUnlocking}
            goHome={goHome}
            goToCreator={goToCreator}
            handleUnlock={handleUnlock}
            handleSubscribe={handleSubscribe}
          />
        )}

        {/* VIEW: CREATOR PAGE */}
        {currentView === "creator" && activeCreator && (
          <CreatorProfileView activeCreator={activeCreator} isSubscribed={isSubscribed} handleSubscribe={handleSubscribe} />
        )}

        {/* VIEW: CREATOR DASHBOARD */}
        {currentView === "dashboard" && <CreatorDashboardView dashboardStats={dashboardStats} handleUpload={handleUpload} />}

        {/* VIEW: USER PROFILE */}
        {currentView === "profile" && <UserProfileView currentUser={currentUser} isSubscribed={isSubscribed} />}

        {/* VIEW: CREATE CREATOR ACCOUNT */}
        {currentView === "createCreator" && <CreateCreatorView />}
      </main>

      {/* --- Floating Notifications / Toasts --- */}
      {showUploadToast && (
        <div className="fixed z-50 flex items-center gap-3 px-6 py-3 text-white duration-300 rounded-lg shadow-xl bottom-8 right-8 bg-slate-900 animate-in slide-in-from-bottom-10">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div>
            <p className="font-medium">Succès !</p>
            <p className="text-xs text-slate-300">Votre vidéo a été publiée.</p>
          </div>
        </div>
      )}

      {/* --- Footer --- */}
      <footer className="py-12 mt-12 bg-white border-t border-slate-200">
        <div className="container px-4 mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-900">
              <Play className="w-3 h-3 text-white fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">OpenStream</span>
          </div>
          <p className="text-sm text-slate-500">© 2024 Plateforme Décentralisée Prototype. Design Concept for demonstration.</p>
        </div>
      </footer>
    </div>
  );
}
