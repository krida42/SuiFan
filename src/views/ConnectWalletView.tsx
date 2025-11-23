import React from "react";
import { ConnectButton } from "@mysten/dapp-kit";
import { Play } from "lucide-react";

export const ConnectWalletView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-slate-50 text-slate-900">
      <div className="flex flex-col items-center w-full max-w-md gap-4 p-8 text-center bg-white border rounded-2xl shadow-lg/40 border-slate-200">
        <div className="flex items-center justify-center w-12 h-12 text-indigo-600 bg-indigo-100 rounded-xl">
          <Play className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold">Connectez votre wallet Sui</h1>
        <p className="text-sm text-slate-500">Pour accéder à la plateforme et publier du contenu, veuillez connecter votre wallet Sui sécurisé.</p>
        <ConnectButton></ConnectButton>
        <p className="text-xs text-slate-400">Aucun wallet ? Installez-en un compatible avec Sui (ex: Ethos, Sui Wallet) puis revenez ici.</p>
      </div>
    </div>
  );
};
