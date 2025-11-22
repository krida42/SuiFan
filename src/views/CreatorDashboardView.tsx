import React from "react";
import { LayoutGrid, Upload } from "lucide-react";
import { DashboardStats } from "../types";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/Card";

interface CreatorDashboardViewProps {
  dashboardStats: DashboardStats | null;
  handleUpload: (e: any) => void;
}

export const CreatorDashboardView: React.FC<CreatorDashboardViewProps> = ({ dashboardStats, handleUpload }) => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in">
      <h1 className="flex items-center gap-2 mb-6 text-2xl font-bold text-slate-900">
        <LayoutGrid className="w-6 h-6 text-indigo-600" />
        Tableau de bord Créateur
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Upload Form */}
        <Card className="border-indigo-100 shadow-md md:col-span-2">
          <div className="p-6 border-b border-slate-100 bg-indigo-50/50 rounded-t-xl">
            <h2 className="flex items-center gap-2 font-semibold text-indigo-900">
              <Upload className="w-4 h-4" />
              Publier un nouveau contenu
            </h2>
          </div>
          <CardContent className="p-6 space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Titre de la vidéo</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md outline-none border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: Tutoriel Exclusif..."
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="w-full h-24 p-2 border border-transparent rounded-md outline-none resize-none border-slate-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="De quoi parle votre vidéo ?"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 transition-all border rounded-lg cursor-pointer border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                <div className="flex items-center gap-2 mb-2">
                  <input type="radio" name="access" id="free" className="text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor="free" className="font-medium text-slate-900">
                    Gratuit
                  </label>
                </div>
                <p className="ml-6 text-xs text-slate-500">Accessible à tous, idéal pour la découverte.</p>
              </div>
              <div className="relative p-4 border-2 border-indigo-100 rounded-lg cursor-pointer bg-indigo-50/30">
                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">Recommandé</div>
                <div className="flex items-center gap-2 mb-2">
                  <input type="radio" name="access" id="premium" defaultChecked className="text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor="premium" className="font-medium text-slate-900">
                    Premium / Payant
                  </label>
                </div>
                <p className="ml-6 text-xs text-slate-500">Réservé aux abonnés ou achat unique.</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 p-8 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-slate-300 bg-slate-50 hover:bg-slate-100">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
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
              <h3 className="mb-4 text-sm font-medium tracking-wider uppercase text-slate-500">Vue d'ensemble</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-slate-900">{dashboardStats?.revenue || "0€"}</div>
                  <div className="text-xs font-medium text-green-600">+12% ce mois-ci</div>
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
              <h3 className="mb-4 text-sm font-medium tracking-wider uppercase text-slate-500">Derniers Uploads</h3>
              <div className="space-y-3">
                {dashboardStats?.recentUploads.map((video) => (
                  <div key={video.id} className="flex items-center gap-3">
                    <div className="w-16 h-10 overflow-hidden rounded bg-slate-200">
                      <img src={video.thumbnailUrl} alt={video.title} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-slate-900">{video.title}</p>
                      <p className="text-xs text-slate-500">
                        {video.uploadedAt} • Visibilité: {video.views}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

