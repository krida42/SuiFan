import React, { useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { CreatorContent } from "../lib/useGetCreatorContent";
import { useDecryptCreatorContent } from "../lib/useDecryptCreatorContent";

interface ContentDetailViewProps {
  content: CreatorContent;
  creatorId: string;
  goBack: () => void;
}

/**
 * Detail page for a single uploaded content.
 *
 * Uses Walrus + Seal to download and decrypt the encrypted blob on the client
 * and renders the resulting `video/mp4` in a player.
 */
export const ContentDetailView: React.FC<ContentDetailViewProps> = ({ content, creatorId, goBack }) => {
  const { videoUrl, isDecrypting, error, decryptContent } = useDecryptCreatorContent();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      console.debug("[ContentDetailView] Trigger decryptContent", {
        blobId: content.blobId,
        creatorId,
      });
      try {
        await decryptContent({ blobId: content.blobId, creatorId });
      } catch (e) {
        if (cancelled) return;
        console.error("[ContentDetailView] Failed to decrypt content", e);
      }
    };
    run();
    return () => {
      console.debug("[ContentDetailView] Cleanup effect for content", {
        blobId: content.blobId,
        creatorId,
      });
      cancelled = true;
    };
  }, [content.blobId, creatorId, decryptContent]);

  return (
    <div className="max-w-4xl mx-auto duration-300 animate-in fade-in">
      {/* Back button */}
      <button
        onClick={goBack}
        className="flex items-center gap-2 mb-4 text-sm text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au créateur</span>
      </button>

      {/* Title */}
      <h1 className="mb-2 text-2xl font-bold text-slate-900">{content.contentName || "Contenu sans titre"}</h1>
      <p className="mb-6 text-sm text-slate-600">{content.contentDescription}</p>

      {/* Video area */}
      <div className="mb-6 overflow-hidden bg-black shadow-lg aspect-video rounded-xl flex items-center justify-center">
        {isDecrypting && !videoUrl && (
          <div className="flex items-center justify-center text-slate-300">
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            <span>Préparation de la vidéo...</span>
          </div>
        )}
        {!isDecrypting && error && (
          <div className="px-4 text-sm text-center text-red-500">{error}</div>
        )}
        {!isDecrypting && videoUrl && (
          <video
            controls
            className="object-contain w-full h-full bg-black"
            src={videoUrl}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        )}
      </div>

      {/* Technical info */}
      <div className="p-4 text-xs bg-slate-50 rounded-xl text-slate-500">
        <div className="font-semibold text-slate-700">Informations techniques</div>
        <div className="mt-2 break-all">
          <span className="font-mono text-[11px]">blobId: {content.blobId}</span>
        </div>
      </div>
    </div>
  );
};


