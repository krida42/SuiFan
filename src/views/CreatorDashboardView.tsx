import React, { ChangeEvent, useEffect, useState } from "react";
import { LayoutGrid, Upload } from "lucide-react";
import { DashboardStats } from "../types";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/Card";
import { useGetCreators } from "../lib/useGetCreators";
import { useEncryptAndPushToWalrus } from "../lib/encryptAndPushToWalrus";

interface CreatorDashboardViewProps {
  dashboardStats: DashboardStats | null;
  handleUpload: (payload: {
    title: string;
    description: string;
    blobId: string;
    creatorId: string;
    fileName: string | null;
  }) => Promise<{ digest: string }>;
}

type ContentCreator = {
  id: string;
  pseudo: string;
  description: string;
  owner: string;
  image_url: string;
};

export const CreatorDashboardView: React.FC<CreatorDashboardViewProps> = ({ dashboardStats, handleUpload }) => {
  const getCreators = useGetCreators();
  const [creators, setCreators] = useState<ContentCreator[]>([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState("");
  const [isLoadingCreators, setIsLoadingCreators] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [blobId, setBlobId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [walrusError, setWalrusError] = useState<string | null>(null);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [suiDigest, setSuiDigest] = useState<string | null>(null);
  const { handleSubmit: handleWalrusSubmit, isUploading } = useEncryptAndPushToWalrus();

  useEffect(() => {
    let isMounted = true;
    async function fetchCreators() {
      try {
        setIsLoadingCreators(true);
        const data = await getCreators();
        if (!isMounted) {
          return;
        }
        setCreators(data);
        setSelectedCreatorId((prev) => prev || data[0]?.id || "");
      } catch (error) {
        console.error("Erreur lors du chargement des créateurs", error);
      } finally {
        if (isMounted) {
          setIsLoadingCreators(false);
        }
      }
    }
    fetchCreators();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!selectedCreatorId) {
      console.warn("Aucun créateur sélectionné pour générer la policy Walrus.");
      return;
    }

    setSelectedFileName(file.name);
    setBlobId(null);
    setWalrusError(null);

    handleWalrusSubmit(file, selectedCreatorId)
      .then((storageInfo) => {
        const maybeBlobId = storageInfo?.info?.newlyCreated?.blobObject?.blobId ?? storageInfo?.info?.blobObject?.blobId ?? storageInfo?.info?.blobId;

        if (!maybeBlobId) {
          console.error("Impossible de récupérer blobId depuis Walrus storageInfo", storageInfo);
          setWalrusError("Erreur: impossible de récupérer l'identifiant du fichier chiffré.");
          return;
        }

        setBlobId(maybeBlobId);
      })
      .catch((error) => {
        console.error("Erreur lors de l'encrypt + push Walrus", error);
        setWalrusError("Erreur lors du chiffrement et de l'envoi sur Walrus. Veuillez réessayer.");
      });
  };

  const handleSubmitClick = async () => {
    setHasTriedSubmit(true);
    setFormError(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription || !blobId) {
      const missing: string[] = [];
      if (!trimmedTitle) missing.push("titre");
      if (!trimmedDescription) missing.push("description");
      if (!blobId) missing.push("fichier chiffré");

      setFormError(`Merci de renseigner: ${missing.join(", ")}.`);
      return;
    }

    if (!selectedCreatorId) {
      setFormError("Veuillez sélectionner un créateur.");
      return;
    }

    if (isUploading) {
      setFormError("Le fichier est encore en cours de chiffrement. Merci de patienter.");
      return;
    }

    try {
      const result = await handleUpload({
        title: trimmedTitle,
        description: trimmedDescription,
        blobId,
        creatorId: selectedCreatorId,
        fileName: selectedFileName,
      });
      setSuiDigest(result.digest);
    } catch (error) {
      console.error("Erreur lors de la publication de la vidéo", error);
      setFormError("Erreur lors de la publication de la vidéo. Veuillez réessayer.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <LayoutGrid className="w-6 h-6 text-indigo-600" />
          Uploader du contenu
        </h1>
        <div className="w-full md:w-72">
          <label className="block mb-1 text-sm font-medium text-slate-700">Sélectionnez un créateur</label>
          <select
            className="w-full p-2 text-sm border rounded-md outline-none border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:text-slate-400"
            value={selectedCreatorId}
            onChange={(event) => setSelectedCreatorId(event.target.value)}
            disabled={isLoadingCreators || creators.length === 0}
          >
            {isLoadingCreators && <option>Chargement...</option>}
            {!isLoadingCreators && creators.length === 0 && <option>Aucun créateur trouvé</option>}
            {!isLoadingCreators &&
              creators.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.pseudo}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        {/* Upload Form */}
        <Card className="w-full max-w-2xl pt-6 border-indigo-100 shadow-md">
          <CardContent className="p-6 space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Titre de la vidéo</label>
              <input
                type="text"
                className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:border-transparent ${
                  hasTriedSubmit && !title.trim() ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"
                }`}
                placeholder="Ex: Tutoriel Exclusif..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {hasTriedSubmit && !title.trim() && <p className="mt-1 text-xs text-red-600">Le titre est requis.</p>}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Description</label>
              <textarea
                className={`w-full h-24 p-2 border rounded-md outline-none resize-none focus:ring-2 focus:border-transparent ${
                  hasTriedSubmit && !description.trim() ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-indigo-500"
                }`}
                placeholder="De quoi parle votre vidéo ?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              {hasTriedSubmit && !description.trim() && <p className="mt-1 text-xs text-red-600">La description est requise.</p>}
            </div>

            {/* <div className="grid grid-cols-2 gap-4">
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
            </div> */}

            <label className="flex flex-col items-center justify-center gap-4 p-8 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-slate-300 bg-slate-50 hover:bg-slate-100">
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                className="hidden"
                onChange={handleFileChange}
                disabled={!selectedCreatorId || isUploading}
              />
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium text-slate-600">{isUploading ? "Chiffrement en cours..." : "Glisser le fichier vidéo ici"}</p>
                <p className="text-xs text-slate-400">MP4, MOV jusqu'à 2Go</p>
                {selectedFileName && (
                  <p className="mt-3 text-xs text-slate-500">
                    Fichier sélectionné: <span className="font-semibold text-slate-700">{selectedFileName}</span>
                  </p>
                )}
                {hasTriedSubmit && !blobId && (
                  <p className="mt-1 text-xs text-red-600">Un fichier doit être sélectionné et chiffré avec succès avant la mise en ligne.</p>
                )}
                {walrusError && <p className="mt-1 text-xs text-red-600">{walrusError}</p>}
              </div>
            </label>

            <div className="pt-2">
              <Button variant="accent" className="w-full" onClick={handleSubmitClick} disabled={isUploading}>
                Mettre en ligne
              </Button>
              {formError && <p className="mt-2 text-xs text-red-600">{formError}</p>}
              {(suiDigest || blobId) && (
                <div className="mt-4 space-y-2 text-xs text-slate-700">
                  {suiDigest && (
                    <>
                      <div className="font-mono break-all">
                        <span className="font-semibold">Sui digest:</span> {suiDigest}
                      </div>
                      <a
                        href={`https://testnet.suivision.xyz/txblock/${suiDigest}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        Voir la transaction Sui dans Suivision
                      </a>
                    </>
                  )}
                  {blobId && (
                    <>
                      <div className="font-mono break-all">
                        <span className="font-semibold">Walrus blobId:</span> {blobId}
                      </div>
                      <a
                        href={`https://walruscan.com/testnet/blob/${blobId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        Voir le blob sur Walrus (testnet)
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
