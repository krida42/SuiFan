import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { CreatorContent } from "../lib/useGetCreatorContent";

interface ContentDetailViewProps {
  content: CreatorContent;
  goBack: () => void;
}

/**
 * Detail page for a single uploaded content.
 *
 * For now, the encrypted blob is \"downloaded\" via a placeholder call to https://example.com,
 * then we use a demo MP4 URL to render the video.
 */
export const ContentDetailView: React.FC<ContentDetailViewProps> = ({ content, goBack }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const downloadToRemoteAndPrepareUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Placeholder: simulate sending the blobId to a remote service.
        // In a real implementation, this would trigger a backend that decrypts
        // the Walrus blob and makes it available as a streamed video file.
        await fetch("https://example.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blobId: content.blobId }),
        }).catch(() => {
          // Ignore network errors for the placeholder – we'll still show a demo video URL.
        });

        // For now, use a public sample MP4 as the playable URL.
        const demoVideoUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

        if (!isMounted) return;
        setVideoUrl(demoVideoUrl);
      } catch (e) {
        if (!isMounted) return;
        console.error("Failed to prepare video URL for content", e);
        setError("Impossible de charger la vidéo pour ce contenu.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    downloadToRemoteAndPrepareUrl();

    return () => {
      isMounted = false;
    };
  }, [content.blobId]);

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
        {isLoading && !videoUrl && (
          <div className="flex items-center justify-center text-slate-300">
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            <span>Préparation de la vidéo...</span>
          </div>
        )}
        {!isLoading && error && (
          <div className="px-4 text-sm text-center text-red-500">{error}</div>
        )}
        {!isLoading && videoUrl && (
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


