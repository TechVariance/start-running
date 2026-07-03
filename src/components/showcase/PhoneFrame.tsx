import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto" style={{ width: 414 }}>
      {/* device shell */}
      <div
        className="relative rounded-[54px] p-[10px] shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #1B2530 0%, #0B0F14 60%, #000 100%)",
          boxShadow: "0 40px 80px -30px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        <div
          className="relative overflow-hidden rounded-[46px] bg-background"
          style={{ height: 844 }}
        >
          {/* Notch */}
          <div className="absolute left-1/2 top-2 z-40 flex h-7 w-32 -translate-x-1/2 items-center justify-center rounded-full bg-black">
            <div className="mr-2 h-2 w-2 rounded-full bg-[#1B2530]" />
            <div className="h-1.5 w-10 rounded-full bg-[#1B2530]" />
          </div>
          {/* Status bar */}
          <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-7 pt-3 text-[13px] font-semibold text-foreground">
            <span className="tabular">9:41</span>
            <span className="w-32" />
            <span className="tabular opacity-80">••• 5G ▮</span>
          </div>
          {/* Screen content */}
          <div className="h-full overflow-y-auto pt-12 pb-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
