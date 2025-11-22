import React from "react";
import { Loader2, Play } from "lucide-react";
import { Video } from "../types";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";

interface HomeViewProps {
  videos: Video[];
  isLoading: boolean;
  goToVideo: (video: Video) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ videos, isLoading, goToVideo }) => {
  return (
    <div className="space-y-8">
      {/* Hero Filter Section */}
      <section className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Découvrir</h1>
          <p className="mt-1 text-slate-500">Les meilleures vidéos de vos créateurs indépendants.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" className="rounded-full">
            Tous
          </Button>
          <Button variant="outline" className="rounded-full">
            Gratuit
          </Button>
          <Button variant="outline" className="rounded-full">
            Premium
          </Button>
          <Button variant="outline" className="rounded-full">
            Tech
          </Button>
        </div>
      </section>

      {/* Video Grid */}
      {isLoading && videos.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <div key={video.id} className="cursor-pointer group" onClick={() => goToVideo(video)}>
              <div className="relative mb-3 overflow-hidden transition-all shadow-sm aspect-video rounded-xl bg-slate-200 group-hover:shadow-md">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={video.isFree ? "free" : "premium"}>{video.isFree ? "Gratuit" : "Premium"}</Badge>
                </div>
                {!video.isFree && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration || "10:00"}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center transition-colors opacity-0 bg-black/0 group-hover:bg-black/10 group-hover:opacity-100">
                  <Play className="w-12 h-12 text-white fill-white drop-shadow-lg" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 overflow-hidden rounded-full bg-slate-100">
                  <img
                    src={video.creatorAvatar || "https://placehold.co/100x100/1e40af/ffffff"}
                    alt={video.creator}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="font-semibold leading-tight transition-colors text-slate-900 group-hover:text-indigo-600 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{video.creator}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {video.views} • {video.uploadedAt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

