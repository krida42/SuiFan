import React from "react";
import { User as UserIcon, ShieldCheck, Unlock, Play } from "lucide-react";
import { User } from "../types";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";

interface UserProfileViewProps {
  currentUser: User | null;
  isSubscribed: boolean;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ currentUser, isSubscribed }) => {
  return (
    <div className="max-w-3xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-6 mb-8">
        <div className="flex items-center justify-center w-20 h-20 text-3xl font-bold text-white bg-indigo-600 border-4 border-white rounded-full shadow-lg">
          JD
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jean Dupont</h1>
          <p className="text-slate-500">jean.dupont@exemple.fr</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="default" className="text-indigo-700 bg-indigo-100">
              Utilisateur Vérifié
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Section: Subscriptions */}
        <section>
          <h2 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-900">
            <UserIcon className="w-5 h-5 text-slate-500" /> Abonnements
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Sub 1 */}
            <Card className="flex items-center gap-4 p-4 transition-colors cursor-pointer hover:border-indigo-200">
              <div className="w-12 h-12 overflow-hidden rounded-full bg-slate-200">
                <img src="https://placehold.co/100x100/6366f1/ffffff" alt="Creator avatar" className="object-cover w-full h-full" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">TechDaily</h4>
                <p className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <ShieldCheck className="w-3 h-3" /> Abonnement Actif
                </p>
              </div>
            </Card>

            {/* Sub 2 (Conditional) */}
            {isSubscribed && (
              <Card className="flex items-center gap-4 p-4 transition-colors border-indigo-500 cursor-pointer hover:border-indigo-200 ring-1 ring-indigo-500/20">
                <div className="w-12 h-12 overflow-hidden rounded-full bg-slate-200">
                  <img
                    src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c26f327a-fef3-4e0a-af22-064615352458.png"
                    alt="Current active creator avatar"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Nouveau Créateur</h4>
                  <p className="text-xs font-medium text-indigo-600">Récemment abonné</p>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Section: Unlocked Content */}
        <section>
          <h2 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-900">
            <Unlock className="w-5 h-5 text-slate-500" /> Contenus Débloqués
          </h2>
          {(currentUser?.unlockedVideoIds?.length || 0) > 0 ? (
            <div className="overflow-hidden bg-white border rounded-xl border-slate-200">
              {currentUser?.unlockedVideoIds.map((id) => (
                <div
                  key={id}
                  className="flex items-center gap-4 p-4 transition-colors border-b cursor-pointer border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Play className="w-5 h-5 text-indigo-700 fill-indigo-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Contenu Premium #{id}</p>
                    <p className="text-xs text-slate-500">Débloqué le {new Date().toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" className="h-8 ml-auto text-xs">
                    Revoir
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
              <p className="text-sm text-slate-500">Aucune vidéo achetée récemment.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

