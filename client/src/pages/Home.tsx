import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sprout, Truck, TrendingUp, AlertTriangle, RefreshCw, Clock } from "lucide-react";
import { Streamdown } from 'streamdown';
import {
  searchMarketPrices,
  searchCropRotation,
  searchLogistics,
  searchAll,
  isAlgoliaConfigured,
  type MarketPriceRecord,
  type CropRotationRecord,
  type LogisticsRecord,
} from "@/lib/algoliaService";
import { trpc } from "@/lib/trpc";
import mockData from "../data/mockData.json";

// Types for context data
type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ContextData = {
  market?: MarketPriceRecord[];
  rotation?: CropRotationRecord[];
  logistics?: LogisticsRecord[];
  lastUpdated?: number | null;
};

// Format timestamp for display
function formatLastUpdated(timestamp: number | null | undefined): string {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
}

export default function Home() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I am **AgriIntel**. \n\nI can help you optimize your farm's profitability using real-time market data, logistics planning, and agronomy rules. \n\n**Try asking:**\n- \"What are almond prices in California?\"\n- \"What should I plant after corn?\"\n- \"Find buyers for my crops.\"",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextData, setContextData] = useState<ContextData>({});
  const [dataSource, setDataSource] = useState<"algolia" | "mock">("algolia");
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.agent.chat.useMutation();

  // Check Algolia configuration on mount
  useEffect(() => {
    // We prefer "algolia" source which triggers the backend Agent Studio (or its simulation)
    // We only fall back to "mock" if we explicitly detect we should, 
    // but the backend handles simulation more robustly now.
    if (isAlgoliaConfigured()) {
      console.log("[AgriIntel] Frontend Algolia credentials detected.");
    } else {
      console.log("[AgriIntel] Using backend Agent Studio (with simulation fallback).");
    }
    setIsInitialized(true);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await processAgentResponse(userMessage.content);
    } catch (error) {
      console.error("Error processing query:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Known crop names for keyword extraction
  const KNOWN_CROPS = [
    'corn', 'soybeans', 'wheat', 'almonds', 'grapes', 'walnuts', 'lettuce', 'tomatoes',
    'apples', 'cherries', 'potatoes', 'peaches', 'cotton', 'sorghum', 'canola', 'pepper',
    'broccoli', 'peanuts', 'tomato'
  ];
  const KNOWN_REGIONS = ['california', 'midwest', 'pacific nw', 'southeast', 'texas'];

  // Extract relevant keywords from query for better Algolia search
  const extractSearchTerms = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    const foundCrops = KNOWN_CROPS.filter(crop => lowerQuery.includes(crop));
    const foundRegions = KNOWN_REGIONS.filter(region => lowerQuery.includes(region));

    // Return found crops/regions, or fall back to original query
    const terms = [...foundCrops, ...foundRegions];
    return terms.length > 0 ? terms.join(' ') : query;
  };

  // Process query with Algolia or fallback to mock data
  const processAgentResponse = async (query: string) => {
    const lowerQuery = query.toLowerCase();
    let responseContent = "";
    let newContext: ContextData = { ...contextData };

    if (dataSource === "algolia") {
      // Use Algolia Agent Studio for orchestration and live data
      try {
        console.log('[AgriIntel] Orchestrating query via Agent Studio:', query);

        const result = await chatMutation.mutateAsync({ message: query });

        if (result.success) {
          newContext.market = result.data.market;
          newContext.rotation = result.data.rotation;
          newContext.logistics = result.data.logistics;
          newContext.lastUpdated = Date.now();

          responseContent = result.message;
        } else {
          throw new Error('Agent Studio returned failure');
        }
      } catch (error) {
        console.error("Agent Studio error, falling back to mock data:", error);
        responseContent = processMockData(lowerQuery, newContext);
      }
    } else {
      // Fallback to mock data
      responseContent = processMockData(lowerQuery, newContext);
    }

    if (responseContent === "") {
      responseContent = "I can help you with **Market Prices**, **Crop Rotation**, and **Logistics**. \n\nTry asking: 'What are the almond prices in California?' or 'Who is buying corn in the Midwest?'";
    } else {
      responseContent += `\n### Implementation Checklist\n\n- [ ] Verify soil moisture before planting.\n- [ ] Lock in price with buyer if favorable.\n- [ ] Schedule transport 3 days in advance.`;
    }

    setContextData(newContext);
    setMessages(prev => [...prev, { role: "assistant", content: responseContent, timestamp: new Date() }]);
  };

  // Process mock data (fallback)
  const processMockData = (lowerQuery: string, newContext: ContextData): string => {
    let responseContent = "";

    if (lowerQuery.includes("price") || lowerQuery.includes("market") || lowerQuery.includes("california")) {
      const marketData = mockData.market_prices.filter(p =>
        lowerQuery.includes(p.region.toLowerCase()) || lowerQuery.includes(p.crop.toLowerCase())
      );
      if (marketData.length > 0) {
        newContext.market = marketData.map(m => ({ ...m, objectID: m.id, lastUpdated: Date.now() }));
        responseContent += `### Market Overview (Mock Data)\n\n`;
        marketData.forEach(m => {
          responseContent += `- **${m.crop}** in ${m.region}: **$${m.price} / ${m.unit}** (Demand Index: ${m.demand_index})\n`;
        });
      }
    }

    if (lowerQuery.includes("plant") || lowerQuery.includes("rotation") || lowerQuery.includes("after")) {
      const rotationData = mockData.crop_rotation;
      newContext.rotation = rotationData.map(r => ({ ...r, objectID: r.id }));
      responseContent += `\n### Crop Rotation (Mock Data)\n\n`;
      rotationData.forEach(r => {
        if (lowerQuery.includes(r.previous_crop.toLowerCase())) {
          responseContent += `- After **${r.previous_crop}**, plant **${r.next_crop}** — ${r.compatibility} (Risk: ${r.risk_score})\n`;
        }
      });
    }

    if (lowerQuery.includes("buyer") || lowerQuery.includes("sell") || lowerQuery.includes("logistics")) {
      const logisticsData = mockData.logistics;
      newContext.logistics = logisticsData.map(l => ({ ...l, objectID: l.id }));
      responseContent += `\n### Logistics (Mock Data)\n\n`;
      logisticsData.forEach(l => {
        responseContent += `- **${l.buyer}** (${l.destination_market}): Ship via **${l.carrier}** at **$${l.cost_per_ton}/ton**\n`;
      });
    }

    return responseContent;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-soil-dark bg-transparent">
      {/* Left Panel: Chat Interface */}
      <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-soil-dark bg-soil-light/90 backdrop-blur-sm relative z-10">
        <div className="p-4 border-b border-soil-dark flex items-center gap-3 bg-moss-green text-white">
          <div className="w-10 h-10 bg-white p-1 border border-soil-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <img src="/images/agri-logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tighter uppercase">AgriIntel</h1>
            <p className="text-xs font-mono opacity-80">v2.1.0 // {dataSource === "algolia" ? "AGENT STUDIO" : "OFFLINE"}</p>
          </div>
          {dataSource === "algolia" && (
            <div className="flex items-center gap-1 text-xs font-mono bg-white/20 px-2 py-1 rounded">
              <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse"></div>
              STUDIO
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-4 border border-soil-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${msg.role === 'user'
                    ? 'bg-white text-soil-dark'
                    : 'bg-soil-light text-soil-dark'
                    }`}
                >
                  <div className="text-[10px] font-mono mb-2 opacity-50 uppercase tracking-widest">
                    {msg.role === 'user' ? 'Operator' : 'System_Agent'} // {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="prose prose-sm max-w-none font-mono leading-relaxed">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neon-lime text-soil-dark px-3 py-1 text-xs font-mono border border-soil-dark animate-pulse flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  QUERYING_{dataSource.toUpperCase()}...
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-soil-dark bg-white">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ENTER COMMAND OR QUERY..."
              className="font-mono text-sm border-soil-dark focus-visible:ring-neon-lime rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-soil-dark text-white hover:bg-moss-green rounded-none border border-soil-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel: Context & Data Dashboard */}
      <div className="flex-1 p-6 overflow-y-auto relative">
        {/* Background Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/images/soil-texture.jpg')] bg-cover mix-blend-overlay z-0"></div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">
          <header className="flex justify-between items-end border-b-2 border-soil-dark pb-4 mb-8">
            <div>
              <h2 className="text-4xl font-bold uppercase tracking-tighter text-soil-dark">Mission Control</h2>
              <p className="font-mono text-sm text-moss-green mt-1">Supply Chain Intelligence Dashboard</p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono text-soil-dark/60">ORCHESTRATION</div>
              <div className={`text-lg font-bold px-2 inline-block ${dataSource === "algolia" ? "text-neon-lime bg-soil-dark" : "text-safety-orange bg-soil-dark"}`}>
                {dataSource === "algolia" ? "AGENT STUDIO" : "MOCK"}
              </div>
              {contextData.lastUpdated && (
                <div className="text-xs font-mono text-soil-dark/60 mt-1 flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  Updated: {formatLastUpdated(contextData.lastUpdated)}
                </div>
              )}
            </div>
          </header>

          {/* Masonry / Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Market Data Card */}
            <Card className="bg-white/80 backdrop-blur border border-soil-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <CardHeader className="border-b border-soil-dark bg-soil-light pb-2">
                <CardTitle className="flex items-center gap-2 text-lg uppercase">
                  <TrendingUp className="w-5 h-5 text-moss-green" /> Market Pulse
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 font-mono text-sm">
                {contextData.market && contextData.market.length > 0 ? (
                  <div className="space-y-3">
                    {contextData.market.slice(0, 5).map((m) => (
                      <div key={m.objectID} className="flex justify-between items-center border-b border-dashed border-soil-dark/30 pb-2 last:border-0">
                        <div>
                          <div className="font-bold">{m.crop}</div>
                          <div className="text-xs opacity-60">{m.region}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-moss-green">${m.price}</div>
                          <div className="text-[10px] uppercase">Demand: {m.demand_index}/100</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-40 italic">Waiting for market data retrieval...</div>
                )}
              </CardContent>
            </Card>

            {/* Crop Rotation Card */}
            <Card className="bg-white/80 backdrop-blur border border-soil-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <CardHeader className="border-b border-soil-dark bg-soil-light pb-2">
                <CardTitle className="flex items-center gap-2 text-lg uppercase">
                  <Sprout className="w-5 h-5 text-moss-green" /> Agronomy Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 font-mono text-sm">
                {contextData.rotation && contextData.rotation.length > 0 ? (
                  <div className="space-y-3">
                    {contextData.rotation.slice(0, 5).map((r) => (
                      <div key={r.objectID} className="bg-soil-light p-2 border border-soil-dark">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">{r.previous_crop} → {r.next_crop}</span>
                          <span className={`px-1 text-xs ${r.compatibility.includes('High') ? 'bg-neon-lime text-soil-dark' : r.compatibility.includes('Low') ? 'bg-safety-orange text-white' : 'bg-yellow-400 text-soil-dark'}`}>
                            {r.compatibility}
                          </span>
                        </div>
                        <div className="text-xs opacity-70">Risk Score: {r.risk_score}/100</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-40 italic">Waiting for rotation data...</div>
                )}
              </CardContent>
            </Card>

            {/* Logistics Card */}
            <Card className="bg-white/80 backdrop-blur border border-soil-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none md:col-span-2 lg:col-span-1">
              <CardHeader className="border-b border-soil-dark bg-soil-light pb-2">
                <CardTitle className="flex items-center gap-2 text-lg uppercase">
                  <Truck className="w-5 h-5 text-moss-green" /> Logistics Chain
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 font-mono text-sm">
                {contextData.logistics && contextData.logistics.length > 0 ? (
                  <div className="space-y-4">
                    {contextData.logistics.slice(0, 4).map((l) => (
                      <div key={l.objectID} className="relative pl-4 border-l-2 border-moss-green">
                        <div className="absolute -left-[5px] top-0 w-2 h-2 bg-moss-green rounded-full"></div>
                        <div className="font-bold text-lg">{l.buyer}</div>
                        <div className="text-xs mb-2">{l.origin_region} ➔ {l.destination_market}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-soil-light p-1">Carrier: {l.carrier}</div>
                          <div className="bg-soil-light p-1">Transit: {l.transit_days} days</div>
                          <div className="bg-neon-lime/20 p-1 col-span-2 font-bold text-center">Cost: ${l.cost_per_ton}/ton</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-40 italic">Waiting for logistics data...</div>
                )}
              </CardContent>
            </Card>

            {/* Active Alerts / Status */}
            <Card className="bg-soil-dark text-soil-light border border-soil-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] rounded-none md:col-span-2 lg:col-span-3">
              <CardHeader className="border-b border-soil-light/20 pb-2">
                <CardTitle className="flex items-center gap-2 text-lg uppercase text-neon-lime">
                  <AlertTriangle className="w-5 h-5" /> System Alerts & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 font-mono text-sm grid md:grid-cols-3 gap-4">
                <div className="border border-neon-lime/30 p-3">
                  <div className="text-xs text-neon-lime mb-1">ORCHESTRATION</div>
                  <div>{dataSource === "algolia" ? "Algolia Agent Studio (Active)" : "Offline Simulation"}</div>
                </div>
                <div className="border border-neon-lime/30 p-3">
                  <div className="text-xs text-neon-lime mb-1">TOOLS LINKED</div>
                  <div>market_prices, crop_rotation, logistics, benchmarks</div>
                </div>
                <div className="border border-neon-lime/30 p-3">
                  <div className="text-xs text-neon-lime mb-1">LAST SYNC</div>
                  <div>{formatLastUpdated(contextData.lastUpdated)}</div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
