import React from "react";
import { CheckCircle } from "lucide-react";
import { Creator } from "../types";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";

interface CreatorProfileViewProps {
  activeCreator: Creator;
  isSubscribed: boolean;
  handleSubscribe: () => void;
}

export const CreatorProfileView: React.FC<CreatorProfileViewProps> = ({ activeCreator, isSubscribed, handleSubscribe }) => {
  return (
    <div className="duration-500 animate-in slide-in-from-bottom-4">
      {/* Cover Image */}
      <div className="relative w-full h-48 overflow-hidden bg-indigo-900 md:h-64 rounded-t-2xl">
        <img
          src="https://placehold.co/1200x400/312e81/ffffff"
          alt="Artistic banner background for creator profile page showing abstract branding elements"
          className="object-cover w-full h-full opacity-80"
        />
      </div>

      {/* Profile Header */}
      <div className="relative px-6 pb-6 mb-8 bg-white border border-t-0 shadow-sm md:px-10 rounded-b-2xl border-slate-200">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="flex items-end gap-6 -mt-12">
            <div className="relative z-10 w-32 h-32 overflow-hidden bg-white border-4 border-white rounded-full shadow-md">
              <img
                src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/056bf547-5117-4821-afe5-c0c4df8e47eb.png"
                alt="Close up portrait of the creator"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="mb-2">
              <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900">
                {activeCreator.name}
                {activeCreator.isVerified && <CheckCircle className="w-5 h-5 text-blue-500 fill-current" />}
              </h1>
              <p className="font-medium text-slate-500">{activeCreator.subscribers} membres</p>
            </div>
          </div>
          <div className="flex w-full gap-3 mb-2 md:w-auto">
            <Button variant={isSubscribed ? "outline" : "accent"} className="flex-1 md:flex-none" onClick={handleSubscribe}>
              {isSubscribed ? "Gérer l'abonnment" : "S'abonner - 9.99€/mois"}
            </Button>
          </div>
        </div>
        <div className="max-w-3xl mt-6">
          <h3 className="mb-2 font-semibold text-slate-900">À propos</h3>
          <p className="leading-relaxed text-slate-600">{activeCreator.bio}</p>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex items-center gap-8 px-2 mb-6 border-b border-slate-200">
        <button className="pb-3 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">Vidéos</button>
        <button className="pb-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-800">Communauté</button>
        <button className="pb-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-800">À propos</button>
      </div>

      {/* Creator Video Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Video 1 */}
        <div className="cursor-pointer group">
          <div className="relative mb-3 overflow-hidden rounded-lg aspect-video bg-slate-200">
            <img
              src="https://placehold.co/500x280/1e1b4b/ffffff"
              alt="Video thumbnail of a tutorial with blue overlay"
              className="object-cover w-full h-full"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="premium">Abonnés</Badge>
            </div>
          </div>
          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600">Workshop Privé #42</h4>
          <p className="mt-1 text-xs text-slate-400">Il y a 2 jours</p>
        </div>
        {/* Video 2 */}
        <div className="cursor-pointer group">
          <div className="relative mb-3 overflow-hidden rounded-lg aspect-video bg-slate-200">
            <img
              src="https://placehold.co/500x280/4338ca/ffffff"
              alt="Video thumbnail showing a camera setup for vlogging"
              className="object-cover w-full h-full"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="free">Public</Badge>
            </div>
          </div>
          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600">Mon setup caméra 2024</h4>
          <p className="mt-1 text-xs text-slate-400">Il y a 5 jours</p>
        </div>
      </div>
    </div>
  );
};

