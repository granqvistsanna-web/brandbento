import BentoCanvas from "./components/BentoCanvas";
import ControlPanel from "./components/ControlPanel";
import "./index.css";

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden selection:bg-black selection:text-white">
      {/* Header Bar */}
      <header className="h-16 border-b border-[#EEE] flex items-center justify-between px-8 bg-white z-20">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <h1 className="text-[12px] font-bold tracking-[0.4em] uppercase text-black">
              Brand Bento
            </h1>
            <span className="text-[9px] text-[#AAA] tracking-widest uppercase mt-0.5">
              Global Moodboard Engine
            </span>
          </div>
          <div className="h-4 w-px bg-[#EEE]" />
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[#666] font-medium">
              Draft Alpha
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-[11px] font-bold uppercase tracking-widest text-black hover:opacity-50 transition-opacity">
            Export Guide
          </button>
          <button className="bg-black text-white px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
            Publish Mood
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Canvas */}
        <BentoCanvas />

        {/* Right: Control Panel */}
        <ControlPanel />
      </main>
    </div>
  );
}
