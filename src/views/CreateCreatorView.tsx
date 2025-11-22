import React from "react";
import { User, Upload } from "lucide-react";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/Card";

export const CreateCreatorView: React.FC = () => {
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

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Compte créateur créé !");
            }}
          >
            {/* Icon Field */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">Icone / Avatar</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-20 h-20 overflow-hidden border-2 border-dashed rounded-full bg-slate-100 border-slate-300">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <Button variant="outline" type="button" onClick={() => document.getElementById("icon-upload")?.click()}>
                  Choisir une image
                </Button>
                <input type="file" id="icon-upload" className="hidden" accept="image/*" />
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
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="w-full h-32 p-2 border border-transparent rounded-md outline-none resize-none border-slate-300 focus:ring-2 focus:ring-indigo-500"
                placeholder="Parlez-nous de votre contenu..."
                required
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
                />
                <span className="absolute left-3 top-2 text-slate-500">€</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Vous recevrez 85% des revenus générés.</p>
            </div>

            <div className="pt-4">
              <Button variant="primary" className="w-full py-6 text-lg" type="submit">
                Créer mon compte Créateur
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

