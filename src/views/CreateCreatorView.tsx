import React, { useMemo, useState } from "react";
import { User, Upload, Loader2 } from "lucide-react";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/Card";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient, ConnectButton } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { createWalrusService } from "../lib/walrusServiceSDK";
import { useWalrusFileUpload } from "../lib/useWalrusUpload";
import { WalrusUpload } from "../lib/WalrusUpload";
import { publishImageOnWalrus } from "../lib/publish_image_on_walrus";

export const CreateCreatorView: React.FC = () => {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subscribePrice, setSubscribePrice] = useState("");
  type SubmitStep = "idle" | "uploading" | "transaction";

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const isSubmitting = submitStep !== "idle";

  const walrusService = useMemo(() => {
    return createWalrusService({
      network: "testnet",
      epochs: 10,
    });
  }, []);

  const { uploading, error, success } = useWalrusFileUpload({
    walrus: walrusService,
    currentAccount,
    signAndExecute: signAndExecuteTransaction,
    suiClient,
    onSuccess: (item) => {
      console.log("Profile JSON uploaded:", item.url);
      // Reset form or navigate away
      alert(`Compte créateur créé ! Metadata: ${item.url}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const createCreatorOnBlockchain = async ({
    name,
    description,
    subscribePrice,
    blobId,
  }: {
    name: string;
    description: string;
    subscribePrice: string;
    blobId: string;
  }) => {
    const tx = new Transaction();
    const image_url = `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;

    tx.moveCall({
      target: "0x2f810ea3d93368e4ec19ecdb591caef8e4f22b0c7e8dfdb9c40fb53e200e56d3::content_creator::new",
      arguments: [tx.pure.string(name), tx.pure.u64(Math.floor(parseFloat(subscribePrice))), tx.pure.string(description), tx.pure.string(image_url)],
    });

    await signAndExecuteTransaction(
      {
        transaction: tx,
      },
      {
        onSuccess: (result) => {
          console.log("Transaction successful:", result);
          alert("Compte créateur créé sur la blockchain !");
          setSubmitStep("idle");
        },
        onError: (error) => {
          console.error("Transaction failed:", error);
          alert("Erreur lors de la création sur la blockchain: " + error.message);
          setSubmitStep("idle");
        },
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading || isSubmitting) return;

    if (!selectedFile) {
      alert("Veuillez choisir une image.");
      return;
    }

    try {
      setSubmitStep("uploading");
      const base64Image = await fileToBase64(selectedFile);

      const profileData = {
        Name: name,
        Description: description,
        IconImage: base64Image,
        SubscribePrice: subscribePrice,
      };

      const jsonString = JSON.stringify(profileData);
      const jsonFile = new File([jsonString], "creator_profile.json", { type: "application/json" });

      const response = await publishImageOnWalrus(new Uint8Array(await jsonFile.arrayBuffer()));
      console.log("Response from Walrus:", response);

      let blobId = "";
      if (response.newlyCreated) {
        blobId = response.newlyCreated.blobObject.blobId;
      } else if (response.alreadyCertified) {
        blobId = response.alreadyCertified.blobId;
      }

      if (blobId) {
        setSubmitStep("transaction");
        await createCreatorOnBlockchain({
          name,
          description,
          subscribePrice,
          blobId,
        });
      } else {
        throw new Error("No blobId returned from Walrus");
      }
    } catch (err) {
      console.error("Error preparing upload:", err);
      alert("Erreur lors de la préparation de l'upload.");
      setSubmitStep("idle");
    }
  };

  return (
    <div className="max-w-xl mx-auto duration-300 animate-in fade-in">
      <Card>
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-indigo-600 bg-indigo-100 rounded-full">
              <User className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Devenir Créateur</h1>
            <p className="mt-2 text-slate-500">Configurez votre profil de créateur pour commencer à publier.</p>
          </div>

          {!currentAccount ? (
            <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center border-2 border-dashed rounded-lg bg-slate-50 border-slate-200">
              <p className="text-slate-600">Veuillez connecter votre portefeuille pour continuer</p>
              <ConnectButton />
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <WalrusUpload />
              {/* Icon Field */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Icone / Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-20 h-20 overflow-hidden border-2 border-dashed rounded-full bg-slate-100 border-slate-300">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Avatar" className="object-cover w-full h-full" />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        document.getElementById("icon-upload")?.click();
                      }}
                      disabled={uploading}
                    >
                      {uploading ? "Upload en cours..." : "Choisir une image"}
                    </Button>
                    {error && <span className="text-xs text-red-500">{error}</span>}
                    {success && <span className="text-xs text-green-500">Profil créé avec succès !</span>}
                  </div>
                  <input type="file" id="icon-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Nom du Créateur</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md outline-none border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Votre nom de scène"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Description</label>
                <textarea
                  className="w-full h-32 p-2 border border-transparent rounded-md outline-none resize-none border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Parlez-nous de votre contenu..."
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Subscription Price Field */}
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Prix de l'abonnement (€/mois)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2 pl-8 border rounded-md outline-none border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="9.99"
                    required
                    value={subscribePrice}
                    onChange={(e) => setSubscribePrice(e.target.value)}
                  />
                  <span className="absolute left-3 top-2 text-slate-500">€</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Vous recevrez 85% des revenus générés.</p>
              </div>

              <div className="pt-4">
                <Button variant="primary" className="w-full py-6 text-lg" type="submit" disabled={uploading || isSubmitting}>
                  {uploading || isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />{" "}
                      {submitStep === "uploading"
                        ? "Upload de l'image..."
                        : submitStep === "transaction"
                        ? "Transaction en cours..."
                        : "Création en cours..."}
                    </span>
                  ) : (
                    "Créer mon compte Créateur"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
