import React from "react";
import { Play, Lock, Heart } from "lucide-react";
import { Video, User } from "../types";
import { Button } from "../components/Button";

interface VideoPlayerViewProps {
  activeVideo: Video;
  currentUser: User | null;
  isSubscribed: boolean;
  isUnlocking: boolean;
  goHome: () => void;
  goToCreator: (creatorName: string) => void;
  handleUnlock: () => void;
  handleSubscribe: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  activeVideo,
  currentUser,
  isSubscribed,
  isUnlocking,
  goHome,
  goToCreator,
  handleUnlock,
  handleSubscribe,
}) => {
  return (
    <div className="max-w-5xl mx-auto duration-300 animate-in fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
        <span onClick={goHome} className="cursor-pointer hover:text-indigo-600">
          Accueil
        </span>
        <span>/</span>
        <span>{activeVideo.isFree ? "Gratuit" : "Premium"}</span>
        <span>/</span>
        <span className="font-medium text-slate-900 line-clamp-1">{activeVideo.title}</span>
      </div>

      {/* Player Container */}
      <div className="relative mb-6 overflow-hidden bg-black shadow-xl aspect-video rounded-xl group">
        {/* CASE 1: FREE VIDEO or UNLOCKED */}
        {activeVideo.isFree || currentUser?.unlockedVideoIds.includes(activeVideo.id) ? (
          <div className="relative flex flex-col items-center justify-center w-full h-full bg-slate-900">
            {/* Fake Video Content */}
            <div className="absolute inset-0 opacity-40">
              <img
                src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a4adbc5d-3797-426d-b4b8-f2eeb3b63af1.png"
                alt="Blurred background of the video content currently playing"
                className="object-cover w-full h-full"
              />
            </div>

            {/* Controls Overlay */}
            <div className="z-10 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-20 h-20 transition-all rounded-full cursor-pointer bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-110">
                <Play className="w-8 h-8 ml-1 text-white fill-white" />
              </div>
              <span className="font-medium tracking-wide text-white">Lecture en cours...</span>
            </div>

            {/* Progress Bar Bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex items-center gap-4 text-xs font-medium text-white">
                <Play className="w-4 h-4 fill-white" />
                <span>0:00 / 14:20</span>
                <div className="flex-1 h-1 overflow-hidden rounded-full bg-white/30">
                  <div className="w-1/3 h-full bg-indigo-500"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CASE 2: LOCKED PAYWALL */
          <div className="relative w-full h-full">
            {/* Blurred Background Image */}
            <div className="absolute inset-0">
              <img
                src="https://placehold.co/1200x675/0f172a/1e293b"
                alt="Blurred preview of premium content protected by paywall"
                className="object-cover w-full h-full scale-105 filter blur-lg"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>

            {/* Paywall Modal Center */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="w-full max-w-md p-8 text-center duration-300 border shadow-2xl bg-white/10 backdrop-blur-md border-white/20 rounded-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-center w-16 h-16 p-4 mx-auto mb-4 rounded-full bg-indigo-500/20 ring-1 ring-indigo-400/50">
                  <Lock className="w-8 h-8 text-indigo-300" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white">Contenu Vérouillé</h2>
                <p className="mb-6 text-slate-200">Ce chat vidéo est réservé aux supporters. Payez une fois ou abonnez-vous pour y accéder.</p>

                <div className="flex flex-col gap-3">
                  <Button variant="accent" className="w-full py-6 text-lg" onClick={handleUnlock} isLoading={isUnlocking}>
                    Débloquer pour {activeVideo.price || "2.99€"}
                  </Button>
                  <div className="my-1 text-xs tracking-widest uppercase text-slate-400">ou</div>
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Description */}
        <div className="lg:col-span-2">
          <h1 className="mb-2 text-2xl font-bold text-slate-900">{activeVideo.title}</h1>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center gap-3 transition-opacity cursor-pointer hover:opacity-80"
                onClick={() => goToCreator(activeVideo.creator)}
              >
                <div className="w-10 h-10 overflow-hidden rounded-full bg-slate-200">
                  <img
                    src="https://placehold.co/100x100/475569/f1f5f9"
                    alt="Creator avatar profile picture"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{activeVideo.creator}</h4>
                  <span className="text-xs text-slate-500">14.5k abonnés</span>
                </div>
              </div>
              <Button variant="secondary" className="h-8 text-xs rounded-full" onClick={handleSubscribe}>
                {isSubscribed ? "Abonné(e)" : "S'abonner"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
                <Heart className="w-5 h-5 transition-colors text-slate-400 hover:text-red-500" />
              </Button>
            </div>
          </div>

          <div className="p-4 text-sm leading-relaxed bg-slate-100 rounded-xl text-slate-700">
            <p className="mb-2 font-semibold">Description</p>
            <p>
              Dans cette vidéo exclusive, nous plongeons dans les détails techniques que je n'aborde jamais sur les réseaux sociaux publics.
              Préparez vos notes, car nous allons couvrir plus de 3 heures de contenu condensé en 20 minutes intenses.
              <br />
              <br />
              Chapitres :<br />
              00:00 - Introduction
              <br />
              02:30 - Les fondamentaux
              <br />
              08:45 - Étude de cas pratique
            </p>
          </div>
        </div>

        {/* Right: Recommended (Static List) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">À suivre</h3>

          {/* Reco 1 */}
          <div className="flex gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 w-40 overflow-hidden rounded-lg aspect-video bg-slate-200">
              <img
                src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ff3aed31-b635-4d90-8fcb-893b29310090.png"
                alt="Thumbnail of recommended video showing code editor screen"
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-indigo-600">Tutoriel React Avancé 2024</h4>
              <p className="mt-1 text-xs text-slate-500">Sophie Tech</p>
            </div>
          </div>

          {/* Reco 2 */}
          <div className="flex gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 w-40 overflow-hidden rounded-lg aspect-video bg-slate-200">
              <img
                src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/3233ad20-2816-4028-8c5b-11ed93b7a457.png"
                alt="Thumbnail of recommended video showing abstract geometric shapes"
                className="object-cover w-full h-full"
              />
              <div className="absolute top-1 right-1 bg-amber-100 text-amber-800 text-[10px] px-1 rounded font-bold border border-amber-200">
                PAYANT
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-indigo-600">Composition Graphique 101</h4>
              <p className="mt-1 text-xs text-slate-500">DesignPro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

