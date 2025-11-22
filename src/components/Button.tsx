import React from "react";
import { Loader2 } from "lucide-react";

export const Button = ({ children, variant = "primary", className = "", onClick, disabled, isLoading }: any) => {
  const baseStyle =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";
  const variants: any = {
    primary: "bg-slate-900 text-white hover:bg-slate-900/90 shadow",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    outline: "border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 hover:text-slate-900",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    destructive: "bg-red-500 text-white shadow-sm hover:bg-red-500/90",
    accent: "bg-indigo-600 text-white hover:bg-indigo-700 shadow",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled || isLoading}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

