"use client";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function GameTestPage() {
  const [mounted, setMounted] = useState(false);
  const [localIp, setLocalIp] = useState("");
  const [numPhones, setNumPhones] = useState(3);
  const [gameUrl, setGameUrl] = useState("");
  const [adminUrl, setAdminUrl] = useState("");
  
  useEffect(() => {
    setMounted(true);
    
    // Try to get local IP (mocked for simplicity, in a real app would come from server or WebRTC)
    const hostname = window.location.hostname;
    setLocalIp(hostname === "localhost" ? "192.168.x.x" : hostname);

    const port = window.location.port ? `:${window.location.port}` : "";
    const base = `${window.location.protocol}//${window.location.hostname}${port}`;
    setGameUrl(`${base}/hall-of-fame/game`);
    setAdminUrl(`${base}/admin/game`);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-zinc-950" />;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="font-serif text-3xl md:text-5xl text-amber-400 mb-2">
            Game Testing Lab 🧪
          </h1>
          <p className="text-zinc-400">
            Use this page to test the real-time polling game with multiple simulated devices, 
            or scan the QR code to test with real phones on your local network.
          </p>
        </div>

        {/* Real Phone Testing Instructions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
          <div className="flex-1 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📱 Test with Real Phones
            </h2>
            <div className="space-y-3 text-zinc-300 text-sm">
              <p>
                <strong>Step 1:</strong> Connect your phones to the <span className="text-amber-400 font-mono">SAME Wi-Fi</span> network as this computer.
              </p>
              <p>
                <strong>Step 2:</strong> Scan the QR code or open your phone's browser and navigate to:
              </p>
              <div className="bg-black/50 p-3 rounded-lg font-mono text-amber-400 break-all select-all border border-zinc-800">
                {gameUrl || "Loading URL..."}
              </div>
              <p className="text-zinc-500 italic mt-2">
                Note: If the URL above says "localhost", you need to access this page via your computer's local IP address (e.g., 192.168.1.5:3000) for phones to connect.
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg shrink-0">
            {gameUrl && <QRCodeSVG value={gameUrl} size={160} />}
          </div>
        </div>

        {/* Local Simulator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              💻 Local Device Simulator
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">Simulated Phones:</span>
              <select 
                value={numPhones} 
                onChange={(e) => setNumPhones(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={1}>1 Phone</option>
                <option value={2}>2 Phones</option>
                <option value={3}>3 Phones</option>
                <option value={4}>4 Phones</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[800px]">
            {/* Admin Panel Frame */}
            <div className={`flex flex-col bg-zinc-900 rounded-2xl border-4 border-emerald-900 overflow-hidden ${numPhones < 4 ? 'lg:col-span-1' : ''}`}>
              <div className="bg-emerald-950 py-2 px-4 flex items-center justify-between border-b border-emerald-900/50">
                <span className="font-bold text-emerald-400 text-sm">👑 Admin Control Panel</span>
                <a href={adminUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-500 hover:text-emerald-300">Open &#8599;</a>
              </div>
              <iframe 
                src="/admin/game" 
                className="flex-1 w-full bg-zinc-950"
                title="Admin Control Panel"
              />
            </div>

            {/* Simulated Phone Frames */}
            {Array.from({ length: numPhones }).map((_, i) => (
              <div key={i} className="flex flex-col bg-zinc-900 rounded-3xl border-[8px] border-zinc-800 overflow-hidden shadow-2xl relative">
                {/* Phone Notch Mock */}
                <div className="absolute top-0 inset-x-0 h-6 bg-zinc-800 rounded-b-2xl w-32 mx-auto z-10" />
                
                <div className="bg-zinc-800 py-1.5 px-4 flex items-center justify-between z-0 pt-6">
                  <span className="font-medium text-zinc-300 text-xs text-center w-full">Player {i + 1}</span>
                </div>
                {/* 
                  Passing a unique query parameter prevents the browser from sharing localStorage 
                  across iframes in some scenarios, but to truly force separate sessions we need sandbox 
                  or incognito. Since sandbox="allow-scripts allow-same-origin" combines storage, 
                  we add a mock query param that the client code ignores, but it helps identify frames.
                  NOTE: In standard Chrome, same-origin iframes share localStorage. If testing requires
                  truly distinct votes from the SAME test page, users might need to use real phones or INC.
                  However, our voterToken is just UUID, which is set once. If localstorage is shared,
                  they'll share the Token. 
                  To fix this for testing, we can append ?testVoter=uuid to the URL, and update 
                  getVoterToken to respect it. 
                */}
                <iframe 
                  src={`/hall-of-fame/game?testId=player-${i+1}-${Date.now()}`} 
                  className="flex-1 w-full bg-[#0a0a0f]"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  title={`Simulated Phone ${i + 1}`}
                />
                
                {/* Home indicator */}
                <div className="h-1 w-1/3 bg-zinc-700 absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full z-10" />
              </div>
            ))}
          </div>

          <p className="text-center text-zinc-500 text-xs mt-4">
            Note: Browsers share localStorage between iframes of the same origin. 
            If you vote on Player 1, Player 2 might also show as voted unless you use separate Incognito windows or real devices.
            For true multi-user testing, open {gameUrl || "the game URL"} in Incognito, Edge, Firefox, and your Phone.
          </p>
        </div>
      </div>
    </div>
  );
}
