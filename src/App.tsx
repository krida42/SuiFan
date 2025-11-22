import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, User, Play, Lock, Unlock, Heart, Upload, Home, Settings, Video, LayoutGrid, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from './services/api';
import { Video as VideoType, Creator, User as UserType, DashboardStats } from './types';

// Shadcn-like Button Component
const Button = ({ children, variant = 'primary', className = '', onClick, disabled, isLoading }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";
  const variants: any = {
    primary: "bg-slate-900 text-white hover:bg-slate-900/90 shadow",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    outline: "border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 hover:text-slate-900",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    destructive: "bg-red-500 text-white shadow-sm hover:bg-red-500/90",
    accent: "bg-indigo-600 text-white hover:bg-indigo-700 shadow"
  };
  
  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

// Shadcn-like Card Components
const Card = ({ children, className = '' }: any) => (
  <div className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'default' }: any) => {
  const styles: any = {
    default: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    premium: "bg-amber-100 text-amber-800 border border-amber-200",
    free: "bg-green-100 text-green-800 border border-green-200",
  };
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${styles[variant]}`}>
      {children}
    </div>
  );
};

// --- Main Application Component ---

export default function VideoPlatformPrototype() {
  // --- State Management ---
  const [currentView, setCurrentView] = useState('home'); // home, video, creator, dashboard, profile
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

  // --- Initial Load ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const [videosData, userData] = await Promise.all([
          api.getVideos(),
          api.getCurrentUser()
        ]);
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
    setCurrentView('home');
    setIsLoading(false);
  };
  
  const goToVideo = async (videoPreview: any) => {
    setIsLoading(true);
    try {
      const fullVideo = await api.getVideoById(videoPreview.id);
      if (fullVideo) {
        setActiveVideo(fullVideo);
        // Check if user has unlocked this video
        const isUnlocked = currentUser?.unlockedVideoIds.includes(fullVideo.id) || fullVideo.isFree;
        // In a real app, we might fetch this status from the backend specifically
        setCurrentView('video');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const goToCreator = async (creatorName: string | any) => {
    // Handle event object if passed directly
    const name = typeof creatorName === 'string' ? creatorName : 'Sophie Tech';
    
    setIsLoading(true);
    try {
      const creator = await api.getCreator(name);
      setActiveCreator(creator);
      // Check subscription status
      setIsSubscribed(currentUser?.subscribedCreatorIds.includes(creator.id) || false);
      setCurrentView('creator');
    } finally {
      setIsLoading(false);
    }
  };

  const goToDashboard = async () => {
    setIsLoading(true);
    const stats = await api.getCreatorDashboard();
    setDashboardStats(stats);
    setCurrentView('dashboard');
    setIsLoading(false);
  };

  const goToProfile = async () => {
    setIsLoading(true);
    const user = await api.getCurrentUser();
    setCurrentUser(user);
    setCurrentView('profile');
    setIsLoading(false);
  };

  const handleUnlock = async () => {
    if (activeVideo && currentUser) {
      setIsUnlocking(true);
      try {
        await api.unlockVideo(activeVideo.id);
        // Update local state
        const updatedUser = { 
          ...currentUser, 
          unlockedVideoIds: [...currentUser.unlockedVideoIds, activeVideo.id] 
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

  const handleUpload = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append('title', 'New Video'); // In real app, gather from form inputs
    
    await api.uploadVideo(formData);
    
    setShowUploadToast(true);
    setIsLoading(false);
    setTimeout(() => setShowUploadToast(false), 3000);
  };

  // --- Mock Data Helpers ---
  // Note: In a real app this would be dynamic. Here we define specific items for the demo.
  
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* --- Top Navigation Bar --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={goHome}>
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-white fill-current" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">OpenStream</span>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button onClick={goHome} className={`hover:text-indigo-600 transition-colors ${currentView === 'home' ? 'text-indigo-600' : ''}`}>Découvrir</button>
              <button onClick={goToCreator} className="hover:text-indigo-600 transition-colors opacity-50 cursor-not-allowed" title="Demo only">Créateurs</button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher une vidéo, un créateur..."
                className="w-full h-10 bg-slate-100 border-none rounded-full pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:flex" onClick={goToDashboard}>
              <Upload className="mr-2 h-4 w-4" />
              Créer
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Bell className="h-5 w-5 text-slate-600" />
            </Button>
            <div className="h-9 w-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all" onClick={goToProfile}>
              <User className="h-5 w-5 text-indigo-700" />
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="container mx-auto px-4 py-8">
        
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <div className="space-y-8">
            {/* Hero Filter Section */}
            <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Découvrir</h1>
                <p className="text-slate-500 mt-1">Les meilleures vidéos de vos créateurs indépendants.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" className="rounded-full">Tous</Button>
                <Button variant="outline" className="rounded-full">Gratuit</Button>
                <Button variant="outline" className="rounded-full">Premium</Button>
                <Button variant="outline" className="rounded-full">Tech</Button>
              </div>
            </section>

            {/* Video Grid */}
            {isLoading && videos.length === 0 ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <div key={video.id} className="group cursor-pointer" onClick={() => goToVideo(video)}>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 mb-3 shadow-sm group-hover:shadow-md transition-all">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={video.isFree ? 'free' : 'premium'}>{video.isFree ? 'Gratuit' : 'Premium'}</Badge>
                      </div>
                      {!video.isFree && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {video.duration || '10:00'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Play className="text-white fill-white h-12 w-12 drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
                        <img src={video.creatorAvatar || "https://placehold.co/100x100/1e40af/ffffff"} alt={video.creator} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{video.creator}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{video.views} • {video.uploadedAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: VIDEO PLAYER */}
        {currentView === 'video' && activeVideo && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <span onClick={goHome} className="hover:text-indigo-600 cursor-pointer">Accueil</span>
              <span>/</span>
              <span>{activeVideo.isFree ? 'Gratuit' : 'Premium'}</span>
              <span>/</span>
              <span className="text-slate-900 font-medium line-clamp-1">{activeVideo.title}</span>
            </div>

            {/* Player Container */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-xl mb-6 group">
              
              {/* CASE 1: FREE VIDEO or UNLOCKED */}
              {(activeVideo.isFree || currentUser?.unlockedVideoIds.includes(activeVideo.id)) ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative">
                  {/* Fake Video Content */}
                  <div className="absolute inset-0 opacity-40">
                     <img 
                       src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a4adbc5d-3797-426d-b4b8-f2eeb3b63af1.png" 
                       alt="Blurred background of the video content currently playing" 
                       className="w-full h-full object-cover"
                     />
                  </div>
                  
                  {/* Controls Overlay */}
                  <div className="z-10 flex flex-col items-center gap-4">
                    <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer hover:scale-110">
                      <Play className="h-8 w-8 text-white fill-white ml-1" />
                    </div>
                    <span className="text-white font-medium tracking-wide">Lecture en cours...</span>
                  </div>

                  {/* Progress Bar Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center gap-4 text-white text-xs font-medium">
                      <Play className="h-4 w-4 fill-white" />
                      <span>0:00 / 14:20</span>
                      <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-indigo-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* CASE 2: LOCKED PAYWALL */
                <div className="w-full h-full relative">
                   {/* Blurred Background Image */}
                    <div className="absolute inset-0">
                        <img 
                            src="https://placehold.co/1200x675/0f172a/1e293b" 
                            alt="Blurred preview of premium content protected by paywall" 
                            className="w-full h-full object-cover filter blur-lg scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60" />
                    </div>

                    {/* Paywall Modal Center */}
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="bg-indigo-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ring-1 ring-indigo-400/50">
                                <Lock className="h-8 w-8 text-indigo-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Contenu Vérouillé</h2>
                            <p className="text-slate-200 mb-6">
                                Ce chat vidéo est réservé aux supporters. Payez une fois ou abonnez-vous pour y accéder.
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <Button variant="accent" className="w-full py-6 text-lg" onClick={handleUnlock} isLoading={isUnlocking}>
                                    Débloquer pour {activeVideo.price || "2.99€"}
                                </Button>
                                <div className="text-xs text-slate-400 uppercase tracking-widest my-1">ou</div>
                                <Button variant="secondary" className="w-full py-5 hover:bg-white/90" onClick={() => goToCreator(activeVideo.creator)}>
                                    S'abonner au créateur (9.99€/mois)
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
              )}
            </div>

            {/* Video Layout: Info & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Description */}
              <div className="lg:col-span-2">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{activeVideo.title}</h1>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => goToCreator(activeVideo.creator)}>
                            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
                                <img src="https://placehold.co/100x100/475569/f1f5f9" alt="Creator avatar profile picture" className="h-full w-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900">{activeVideo.creator}</h4>
                                <span className="text-xs text-slate-500">14.5k abonnés</span>
                            </div>
                        </div>
                        <Button variant="secondary" className="h-8 rounded-full text-xs" onClick={handleSubscribe}>
                            {isSubscribed ? "Abonné(e)" : "S'abonner"}
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                            <Heart className="h-5 w-5 text-slate-400 hover:text-red-500 transition-colors" />
                        </Button>
                    </div>
                </div>
                
                <div className="bg-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                    <p className="font-semibold mb-2">Description</p>
                    <p>
                        Dans cette vidéo exclusive, nous plongeons dans les détails techniques que je n'aborde jamais sur les réseaux sociaux publics. 
                        Préparez vos notes, car nous allons couvrir plus de 3 heures de contenu condensé en 20 minutes intenses.
                        <br/><br/>
                        Chapitres :<br/>
                        00:00 - Introduction<br/>
                        02:30 - Les fondamentaux<br/>
                        08:45 - Étude de cas pratique
                    </p>
                </div>
              </div>

              {/* Right: Recommended (Static List) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">À suivre</h3>
                 
                 {/* Reco 1 */}
                <div className="flex gap-3 group cursor-pointer">
                    <div className="relative w-40 aspect-video bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ff3aed31-b635-4d90-8fcb-893b29310090.png" alt="Thumbnail of recommended video showing code editor screen" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="font-medium text-sm text-slate-900 line-clamp-2 group-hover:text-indigo-600">Tutoriel React Avancé 2024</h4>
                        <p className="text-xs text-slate-500 mt-1">Sophie Tech</p>
                    </div>
                </div>

                {/* Reco 2 */}
                <div className="flex gap-3 group cursor-pointer">
                    <div className="relative w-40 aspect-video bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                         <img src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/3233ad20-2816-4028-8c5b-11ed93b7a457.png" alt="Thumbnail of recommended video showing abstract geometric shapes" className="w-full h-full object-cover" />
                         <div className="absolute top-1 right-1 bg-amber-100 text-amber-800 text-[10px] px-1 rounded font-bold border border-amber-200">PAYANT</div>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm text-slate-900 line-clamp-2 group-hover:text-indigo-600">Composition Graphique 101</h4>
                        <p className="text-xs text-slate-500 mt-1">DesignPro</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: CREATOR PAGE */}
        {currentView === 'creator' && activeCreator && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
             {/* Cover Image */}
             <div className="h-48 md:h-64 w-full rounded-t-2xl overflow-hidden relative bg-indigo-900">
                <img src="https://placehold.co/1200x400/312e81/ffffff" alt="Artistic banner background for creator profile page showing abstract branding elements" className="w-full h-full object-cover opacity-80" />
             </div>
             
             {/* Profile Header */}
             <div className="px-6 md:px-10 pb-6 bg-white rounded-b-2xl shadow-sm border border-t-0 border-slate-200 mb-8 relative">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                    <div className="flex items-end gap-6 -mt-12">
                        <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden relative z-10">
                            <img src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/056bf547-5117-4821-afe5-c0c4df8e47eb.png" alt="Close up portrait of the creator" className="w-full h-full object-cover" />
                        </div>
                        <div className="mb-2">
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                                {activeCreator.name} 
                                {activeCreator.isVerified && <CheckCircle className="h-5 w-5 text-blue-500 fill-current" />}
                            </h1>
                            <p className="text-slate-500 font-medium">{activeCreator.subscribers} membres</p>
                        </div>
                    </div>
                    <div className="flex gap-3 mb-2 w-full md:w-auto">
                        <Button 
                            variant={isSubscribed ? "outline" : "accent"} 
                            className="flex-1 md:flex-none"
                            onClick={handleSubscribe}
                        >
                            {isSubscribed ? "Gérer l'abonnment" : "S'abonner - 9.99€/mois"}
                        </Button>
                    </div>
                </div>
                <div className="mt-6 max-w-3xl">
                    <h3 className="font-semibold text-slate-900 mb-2">À propos</h3>
                    <p className="text-slate-600 leading-relaxed">
                        {activeCreator.bio}
                    </p>
                </div>
             </div>

             {/* Content Tabs */}
             <div className="flex items-center gap-8 border-b border-slate-200 mb-6 px-2">
                 <button className="pb-3 border-b-2 border-indigo-600 text-indigo-600 font-medium text-sm">Vidéos</button>
                 <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-sm">Communauté</button>
                 <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-sm">À propos</button>
             </div>

             {/* Creator Video Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Video 1 */}
                 <div className="group cursor-pointer">
                    <div className="relative aspect-video rounded-lg bg-slate-200 mb-3 overflow-hidden">
                        <img src="https://placehold.co/500x280/1e1b4b/ffffff" alt="Video thumbnail of a tutorial with blue overlay" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2"><Badge variant="premium">Abonnés</Badge></div>
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600">Workshop Privé #42</h4>
                    <p className="text-xs text-slate-400 mt-1">Il y a 2 jours</p>
                 </div>
                  {/* Video 2 */}
                  <div className="group cursor-pointer">
                    <div className="relative aspect-video rounded-lg bg-slate-200 mb-3 overflow-hidden">
                        <img src="https://placehold.co/500x280/4338ca/ffffff" alt="Video thumbnail showing a camera setup for vlogging" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2"><Badge variant="free">Public</Badge></div>
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600">Mon setup caméra 2024</h4>
                    <p className="text-xs text-slate-400 mt-1">Il y a 5 jours</p>
                 </div>
             </div>
          </div>
        )}

        {/* VIEW: CREATOR DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="max-w-4xl mx-auto animate-in fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <LayoutGrid className="h-6 w-6 text-indigo-600" />
                Tableau de bord Créateur
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upload Form */}
                <Card className="md:col-span-2 border-indigo-100 shadow-md">
                    <div className="p-6 border-b border-slate-100 bg-indigo-50/50 rounded-t-xl">
                        <h2 className="font-semibold text-indigo-900 flex items-center gap-2">
                            <Upload className="h-4 w-4" /> 
                            Publier un nouveau contenu
                        </h2>
                    </div>
                    <CardContent className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Titre de la vidéo</label>
                            <input type="text" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="Ex: Tutoriel Exclusif..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea className="w-full p-2 border border-slate-300 rounded-md h-24 resize-none focus:ring-2 focus:ring-indigo-500 border-transparent outline-none" placeholder="De quoi parle votre vidéo ?"></textarea>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border border-slate-200 rounded-lg p-4 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="radio" name="access" id="free" className="text-indigo-600 focus:ring-indigo-500" />
                                    <label htmlFor="free" className="font-medium text-slate-900">Gratuit</label>
                                </div>
                                <p className="text-xs text-slate-500 ml-6">Accessible à tous, idéal pour la découverte.</p>
                            </div>
                            <div className="border-2 border-indigo-100 bg-indigo-50/30 rounded-lg p-4 cursor-pointer relative">
                                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">Recommandé</div>
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="radio" name="access" id="premium" defaultChecked className="text-indigo-600 focus:ring-indigo-500" />
                                    <label htmlFor="premium" className="font-medium text-slate-900">Premium / Payant</label>
                                </div>
                                <p className="text-xs text-slate-500 ml-6">Réservé aux abonnés ou achat unique.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 border-2 border-dashed border-slate-300 rounded-lg p-8 justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                             <div className="text-center">
                                <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                                <p className="text-sm font-medium text-slate-600">Glisser le fichier vidéo ici</p>
                                <p className="text-xs text-slate-400">MP4, MOV jusqu'à 2Go</p>
                             </div>
                        </div>

                        <div className="pt-2">
                            <Button variant="accent" className="w-full" onClick={handleUpload}>
                                Mettre en ligne
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats / Recent */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Vue d'ensemble</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-3xl font-bold text-slate-900">{dashboardStats?.revenue || "0€"}</div>
                                    <div className="text-xs text-green-600 font-medium">+12% ce mois-ci</div>
                                    <div className="text-xs text-slate-400">Revenus totaux</div>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div>
                                    <div className="text-3xl font-bold text-slate-900">{dashboardStats?.subscribersCount || 0}</div>
                                    <div className="text-xs text-slate-400">Nouveaux abonnés</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Derniers Uploads</h3>
                            <div className="space-y-3">
                                {dashboardStats?.recentUploads.map((video) => (
                                  <div key={video.id} className="flex items-center gap-3">
                                      <div className="h-10 w-16 bg-slate-200 rounded overflow-hidden">
                                          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover"/>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-slate-900 truncate">{video.title}</p>
                                          <p className="text-xs text-slate-500">{video.uploadedAt} • Visibilité: {video.views}</p>
                                      </div>
                                  </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
          </div>
        )}

        {/* VIEW: USER PROFILE */}
        {currentView === 'profile' && (
            <div className="max-w-3xl mx-auto animate-in fade-in">
                <div className="flex items-center gap-6 mb-8">
                    <div className="h-20 w-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                        JD
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Jean Dupont</h1>
                        <p className="text-slate-500">jean.dupont@exemple.fr</p>
                        <div className="flex gap-2 mt-2">
                             <Badge variant="default" className="bg-indigo-100 text-indigo-700">Utilisateur Vérifié</Badge>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Section: Subscriptions */}
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-slate-500" /> Abonnements
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Sub 1 */}
                            <Card className="flex items-center p-4 gap-4 hover:border-indigo-200 transition-colors cursor-pointer">
                                <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
                                    <img src="https://placehold.co/100x100/6366f1/ffffff" alt="Creator avatar" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">TechDaily</h4>
                                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" /> Abonnement Actif
                                    </p>
                                </div>
                            </Card>
                            
                            {/* Sub 2 (Conditional) */}
                            {isSubscribed && (
                                <Card className="flex items-center p-4 gap-4 hover:border-indigo-200 transition-colors cursor-pointer border-indigo-500 ring-1 ring-indigo-500/20">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
                                        <img src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c26f327a-fef3-4e0a-af22-064615352458.png" alt="Current active creator avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">Nouveau Créateur</h4>
                                        <p className="text-xs text-indigo-600 font-medium">Récemment abonné</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </section>

                    {/* Section: Unlocked Content */}
                    <section>
                         <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Unlock className="h-5 w-5 text-slate-500" /> Contenus Débloqués
                        </h2>
                        {(currentUser?.unlockedVideoIds?.length || 0) > 0 ? (
                             <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                {currentUser?.unlockedVideoIds.map((id) => (
                                    <div key={id} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer">
                                        <div className="bg-indigo-100 p-2 rounded-lg">
                                            <Play className="h-5 w-5 text-indigo-700 fill-indigo-700" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">Contenu Premium #{id}</p>
                                            <p className="text-xs text-slate-500">Débloqué le {new Date().toLocaleDateString()}</p>
                                        </div>
                                        <Button variant="ghost" className="ml-auto text-xs h-8">Revoir</Button>
                                    </div>
                                ))}
                             </div>
                        ) : (
                             <div className="text-center p-8 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                                <p className="text-slate-500 text-sm">Aucune vidéo achetée récemment.</p>
                             </div>
                        )}
                    </section>
                </div>
            </div>
        )}
      </main>

      {/* --- Floating Notifications / Toasts --- */}
      {showUploadToast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-10 duration-300 z-50">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
                <p className="font-medium">Succès !</p>
                <p className="text-xs text-slate-300">Votre vidéo a été publiée.</p>
            </div>
        </div>
      )}

      {/* --- Footer --- */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                <div className="h-6 w-6 bg-slate-900 rounded flex items-center justify-center">
                   <Play className="h-3 w-3 text-white fill-current" />
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-900">OpenStream</span>
            </div>
            <p className="text-slate-500 text-sm">© 2024 Plateforme Décentralisée Prototype. Design Concept for demonstration.</p>
        </div>
      </footer>
    </div>
  );
}
