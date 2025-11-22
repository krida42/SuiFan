import React from "react";

export const Card = ({ children, className = "" }: any) => (
  <div className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = "" }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

