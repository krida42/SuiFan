import React, { useState } from "react";
import { User, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/Card";
import { useCurrentAccount, useSignAndExecuteTransaction, ConnectButton } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { allCreatorObjectId, ContentCreatorpackageId } from "../lib/package_id";

export const CreateCreatorView: React.FC = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subscribePrice, setSubscribePrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  type SubmitStep = "idle" | "transaction";
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const isSubmitting = submitStep !== "idle";

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

    tx.moveCall({
      target: `${ContentCreatorpackageId}::content_creator::new`,
      arguments: [
        tx.object(allCreatorObjectId),
        tx.pure.string(name),
        tx.pure.u64(Math.floor(parseFloat(subscribePrice))),
        tx.pure.string(description),
        tx.pure.string(blobId),
      ],
    });

    await signAndExecuteTransaction(
      {
        transaction: tx,
      },
      {
        onSuccess: (result: { digest: string }) => {
          console.log("Transaction successful:", result);
          // Store transaction digest so we can show a confirmation view
          // and link to Suivision.
          setTxDigest(result.digest);
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

    if (isSubmitting) return;

    if (!imageUrl) {
      alert("Veuillez saisir une URL d'image.");
      return;
    }

    try {
      setSubmitStep("transaction");
      await createCreatorOnBlockchain({
        name,
        description,
        subscribePrice,
        blobId: imageUrl,
      });
    } catch (err) {
      console.error("Error preparing upload:", err);
      alert("Erreur lors de la création sur la blockchain.");
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

          {txDigest ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 mb-2 text-green-600 bg-green-100 rounded-full">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Compte créateur créé avec succès</h2>
              <p className="text-sm text-slate-600">Votre transaction a été confirmée sur la blockchain Sui.</p>
              <div className="w-full max-w-md p-3 mt-2 font-mono text-xs break-all border rounded-md bg-slate-50 border-slate-200 text-slate-700">
                <span className="font-semibold">Digest:</span> {txDigest}
              </div>
              <a
                href={`https://testnet.suivision.xyz/txblock/${txDigest}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Voir la transaction dans Suivision
              </a>
              {imageUrl && (
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Voir l'image
                </a>
              )}
            </div>
          ) : !currentAccount ? (
            <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center border-2 border-dashed rounded-lg bg-slate-50 border-slate-200">
              <p className="text-slate-600">Veuillez connecter votre portefeuille pour continuer</p>
              <ConnectButton />
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Icon Field */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">URL de l'image / Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-20 h-20 overflow-hidden border-2 border-dashed rounded-full bg-slate-100 border-slate-300">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Avatar" className="object-cover w-full h-full" />
                    ) : (
                      <span className="px-2 text-xs text-center text-slate-400">Aperçu de l'image</span>
                    )}
                  </div>
                  <input
                    type="url"
                    className="flex-1 w-full p-2 border rounded-md outline-none border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://exemple.com/mon-image.jpg"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
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
                <p className="mt-1 text-xs text-slate-500">Vous recevrez 99% des revenus générés.</p>
              </div>

              <div className="pt-4">
                <Button variant="primary" className="w-full py-6 text-lg" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> {submitStep === "transaction" ? "Transaction en cours..." : "Création en cours..."}
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
