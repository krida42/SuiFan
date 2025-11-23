import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Creator } from "../types";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { useGetCreatorContent, CreatorContent } from "../lib/useGetCreatorContent";

interface CreatorProfileViewProps {
  activeCreator: Creator;
  isSubscribed: boolean;
  isSubscribing: boolean;
  handleSubscribe: () => void;
  goToContent: (content: CreatorContent) => void;
}

export const CreatorProfileView: React.FC<CreatorProfileViewProps> = ({
  activeCreator,
  isSubscribed,
  isSubscribing,
  handleSubscribe,
  goToContent,
}) => {
  const getCreatorContent = useGetCreatorContent();
  const [contents, setContents] = useState<CreatorContent[]>([]);
  const [isLoadingContents, setIsLoadingContents] = useState(false);
  const [contentsError, setContentsError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCreator?.id) {
      console.warn("CreatorProfileView mounted without a valid activeCreator.id");
      setContents([]);
      return;
    }

    let isMounted = true;

    const loadContents = async () => {
      try {
        setIsLoadingContents(true);
        setContentsError(null);
        const data = await getCreatorContent(activeCreator.id);
        if (!isMounted) return;
        setContents(data);
      } catch (error) {
        console.error("Erreur lors du chargement des contenus du créateur", error);
        if (isMounted) {
          setContentsError("Impossible de charger les contenus de ce créateur.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingContents(false);
        }
      }
    };

    loadContents();

    return () => {
      isMounted = false;
    };
  }, [activeCreator.id]);

  return (
    <div className="duration-500 animate-in slide-in-from-bottom-4">
      {/* Cover Image */}
      <div className="relative w-full h-48 overflow-hidden bg-indigo-900 md:h-64 rounded-t-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
        <img className="object-cover w-full h-full opacity-80" />
      </div>

      {/* Profile Header */}
      <div className="relative px-6 pb-6 mb-8 glass-panel border-t-0 shadow-xl md:px-10 rounded-b-2xl">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="flex items-end gap-6 -mt-12 z-20">
            <div className="relative z-10 w-32 h-32 overflow-hidden bg-slate-800 border-4 border-slate-900 rounded-full shadow-2xl">
              <img
                src={activeCreator.avatarUrl || "https://avatar.iran.liara.run/public"}
                alt="Close up portrait of the creator"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="mb-2">
              <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
                {activeCreator.name}
                {activeCreator.isVerified && <CheckCircle className="w-5 h-5 text-blue-400 fill-current" />}
              </h1>
              <p className="font-medium text-slate-300">{activeCreator.subscribers} membres</p>
            </div>
          </div>
          <div className="flex w-full gap-3 mb-2 md:w-auto">
            <Button
              variant={isSubscribed ? "outline" : "accent"}
              className="flex-1 md:flex-none"
              onClick={handleSubscribe}
              disabled={isSubscribed || isSubscribing}
            >
              {isSubscribed ? "Abonné" : `S'abonner - ${activeCreator.pricePerMonth ? `${activeCreator.pricePerMonth} SUI/mois` : "Prix inconnu"}`}
            </Button>
          </div>
        </div>
        <div className="max-w-3xl mt-6">
          <h3 className="mb-2 font-semibold text-white">À propos</h3>
          <p className="leading-relaxed text-slate-300">{activeCreator.bio}</p>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex items-center gap-8 px-2 mb-6 border-b border-white/10">
        <button className="pb-3 text-sm font-medium text-indigo-400 border-b-2 border-indigo-400">Vidéos</button>
        <button className="pb-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-colors">Communauté</button>
        <button className="pb-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-colors">À propos</button>
      </div>

      {/* Creator Video Grid */}
      <div className="min-h-[160px]">
        {isLoadingContents ? (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 className="w-5 h-5 mr-2 text-indigo-400 animate-spin" />
            <span>Chargement des contenus...</span>
          </div>
        ) : contentsError ? (
          <p className="py-6 text-sm text-center text-red-400">{contentsError}</p>
        ) : contents.length === 0 ? (
          <p className="py-6 text-sm text-center text-slate-400">Aucun contenu publié pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((content) => (
              <div key={content.id} className="cursor-pointer group" onClick={() => goToContent(content)}>
                <div className="relative mb-3 overflow-hidden rounded-xl aspect-video bg-slate-800 border border-white/5 group-hover:border-indigo-500/30 transition-all shadow-lg group-hover:shadow-indigo-500/20">
                  <div className="flex items-center justify-center w-full h-full text-xs font-medium text-slate-400 bg-white/5 backdrop-blur-sm">
                    Contenu chiffré
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="free">On-chain</Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">{content.contentName || "Contenu sans titre"}</h4>
                <p className="mt-1 text-xs text-slate-400 line-clamp-3">{content.contentDescription}</p>
                <p className="mt-1 text-[10px] text-slate-500 break-all font-mono">
                  blobId: {content.blobId.slice(0, 10)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
