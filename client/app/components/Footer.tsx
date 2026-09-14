export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-[#05070d]">
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-10">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Branding & Status */}
          <div className="flex flex-col items-center gap-1 md:items-start">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <p className="text-sm font-semibold tracking-wide text-white">
                Portfolio Intelligence Engine
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Real-time asset tracking & analytical performance modeling.
            </p>
          </div>

          {/* Quick Stats / Meta Pills */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-400">
            <div>
              Currency: <span className="font-mono font-medium text-white">INR (₹)</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div>
              Refresh: <span className="font-mono font-medium text-white">15s Auto</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-medium text-emerald-400">Market Feed Active</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-900 pt-6 text-[11px] text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Portfolio Dashboard. For informational purposes only. Not investment advice.
          </p>

          <div className="flex items-center gap-4">
            <span className="cursor-pointer transition-colors hover:text-slate-300">Privacy Policy</span>
            {/* <span>•</span> */}
            <span className="cursor-pointer transition-colors hover:text-slate-300">Terms of Service</span>
            {/* <span>•</span> */}
            <span className="cursor-pointer transition-colors hover:text-slate-300">Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}