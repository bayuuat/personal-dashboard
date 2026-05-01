"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Job Sniper",
    subtitle: "Pantau peluang kerja dan progres aplikasi secara ringkas.",
  },
  "/mana-uang": {
    title: "Mana Uang",
    subtitle: "Lihat transaksi dan insight pengeluaran dalam satu tempat.",
  },
};

export function TopHeader() {
  const pathname = usePathname();
  const current = pathname?.startsWith("/mana-uang") ? "/mana-uang" : "/";
  const meta = pageMeta[current];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background px-4 py-4 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{meta.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta.subtitle}</p>
        </div>
        <div className="relative w-full max-w-xl shrink-0">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <div
            className="flex h-11 items-center rounded-full border border-border bg-card pl-10 pr-4 text-sm text-muted-foreground"
            role="presentation"
          >
            Cari… (contoh)
          </div>
        </div>
      </div>
    </header>
  );
}
