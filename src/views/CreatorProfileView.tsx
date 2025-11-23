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
        <img
          src={activeCreator.bannerUrl || "https://placehold.co/1200x400/312e81/ffffff"}
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
                src={
                  activeCreator.avatarUrl ||
                  "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/056bf547-5117-4821-afe5-c0c4df8e47eb.png"
                }
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
      <div className="min-h-[160px]">
        {isLoadingContents ? (
          <div className="flex items-center justify-center py-10 text-slate-500">
            <Loader2 className="w-5 h-5 mr-2 text-indigo-600 animate-spin" />
            <span>Chargement des contenus...</span>
          </div>
        ) : contentsError ? (
          <p className="py-6 text-sm text-center text-red-600">{contentsError}</p>
        ) : contents.length === 0 ? (
          <p className="py-6 text-sm text-center text-slate-500">Aucun contenu publié pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((content) => (
              <div key={content.id} className="cursor-pointer group" onClick={() => goToContent(content)}>
                <div className="relative mb-3 overflow-hidden rounded-lg aspect-video bg-slate-200">
                  <div className="flex items-center justify-center w-full h-full text-xs font-medium text-slate-500 bg-slate-100">
                    Contenu chiffré
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="free">On-chain</Badge>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 line-clamp-2">{content.contentName || "Contenu sans titre"}</h4>
                <p className="mt-1 text-xs text-slate-500 line-clamp-3">{content.contentDescription}</p>
                <p className="mt-1 text-[10px] text-slate-400 break-all">
                  blobId: <span className="font-mono">{content.blobId.slice(0, 10)}...</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
