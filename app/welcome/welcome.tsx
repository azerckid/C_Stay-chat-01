import { SafeArea, AppHeader } from "../components/layout";
import logoDark from "./logo-dark.svg";

export function Welcome() {
  return (
    <SafeArea className="items-center justify-center p-6 overflow-hidden relative">
      <AppHeader />
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-blue/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" />

      <div className="z-10 w-full max-w-lg space-y-12 animate-spring-in pt-12">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-bold font-sans tracking-tight text-glow-blue">
            Premium AI Chat
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Next Generation Travel Concierge
          </p>
        </header>

        <section className="glass-card p-8 rounded-[2rem] space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white pl-1 font-sans">Experience the Future</h2>
            <p className="text-sm text-muted-foreground pl-1">
              Try our glassmorphism components and crystal clear typography.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neon-blue/80 pl-1">
                AI Prompt
              </label>
              <input
                type="text"
                placeholder="Where should I go for Christmas?"
                className="w-full h-14 px-6 rounded-2xl glass-input text-white placeholder:text-white/20 outline-none"
              />
            </div>

            <button className="w-full h-14 rounded-2xl glass-premium text-white font-bold text-lg hover:scale-[0.98] transition-transform active:scale-95 shadow-[0_0_20px_rgba(0,209,255,0.2)]">
              Get Started
            </button>
          </div>
        </section>

        <footer className="flex justify-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs font-medium text-white/60">AI Orchestrator Online</span>
          </div>
        </footer>
      </div>
    </SafeArea>
  );
}
