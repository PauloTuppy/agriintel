import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Send, Sprout, Truck, TrendingUp, AlertTriangle, MapPin, Leaf } from "lucide-react";
import { Streamdown } from 'streamdown';
import mockData from "../data/mockData.json";

// Types for our mock data
type MarketPrice = { id: string; region: string; crop: string; price: number; unit: string; demand_index: number; date: string };
type CropRotation = { id: string; soil_type: string; climate_zone: string; previous_crop: string; next_crop: string; risk_score: number; compatibility: string };
type Logistics = { id: string; origin_region: string; destination_market: string; buyer: string; carrier: string; cost_per_ton: number; transit_days: number };
type Benchmark = { id: string; region: string; crop_mix: string[]; margin: string; yield: string; practices: string };

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ContextData = {
  market?: MarketPrice[];
  rotation?: CropRotation[];
  logistics?: Logistics[];
  benchmark?: Benchmark[];
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I am **AgriIntel**. \n\nI can help you optimize your farm's profitability using real-time market data, logistics planning, and agronomy rules. \n\n**Try asking:**\n- \"What should I plant in California after corn?\"\n- \"Find buyers for my almonds in the Midwest.\"",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextData, setContextData] = useState<ContextData>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Simulated Agent Logic
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate network delay and agent "thinking"
    setTimeout(() => {
      processAgentResponse(userMessage.content);
    }, 1500);
  };

  const processAgentResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    let responseContent = "";
    let newContext: ContextData = { ...contextData };

    // Simple keyword matching to simulate "Command-ify" logic
    // In a real app, this would be an LLM call parsing intent into commands

    if (lowerQuery.includes("price") || lowerQuery.includes("market") || lowerQuery.includes("california")) {
      const marketData = mockData.market_prices.filter(p => lowerQuery.includes(p.region.toLowerCase()) || lowerQuery.includes(p.crop.toLowerCase()));
      if (marketData.length > 0) {
        newContext.market = marketData;
        responseContent += `### Market Overview\n\nBased on data from **${marketData[0].date}**, here are the current prices:\n\n`;
        marketData.forEach(m => {
          responseContent += `- **${m.crop}** in ${m.region}: **$${m.price} / ${m.unit}** (Demand Index: ${m.demand_index})\n`;
        });
      } else {
        // Fallback if no specific match, show all California data as default example
        const defaultData = mockData.market_prices.filter(p => p.region === "California");
        newContext.market = defaultData;
        responseContent += `### Market Overview\n\nI couldn't find specific data for your exact query, but here is the latest from **California**:\n\n`;
        defaultData.forEach(m => {
          responseContent += `- **${m.crop}**: **$${m.price} / ${m.unit}**\n`;
        });
      }
    }

    if (lowerQuery.includes("plant") || lowerQuery.includes("rotation") || lowerQuery.includes("after")) {
      const rotationData = mockData.crop_rotation;
      newContext.rotation = rotationData;
      responseContent += `\n### Data-Driven Recommendation\n\nConsidering crop rotation rules:\n\n`;
      rotationData.forEach(r => {
        if (lowerQuery.includes(r.previous_crop.toLowerCase())) {
           responseContent += `- After **${r.previous_crop}**, planting **${r.next_crop}** is **${r.compatibility}** compatibility (Risk Score: ${r.risk_score}).\n`;
        }
      });
      if (!responseContent.includes("After")) {
         responseContent += `- **General Rule**: Legumes (like Soybeans) fix nitrogen, making them excellent precursors to heavy feeders like Corn.\n`;
      }
    }

    if (lowerQuery.includes("buyer") || lowerQuery.includes("sell") || lowerQuery.includes("logistics")) {
      const logisticsData = mockData.logistics;
      newContext.logistics = logisticsData;
      responseContent += `\n### Logistics & Buyers\n\nOptimized routes found:\n\n`;
      logisticsData.forEach(l => {
         responseContent += `- **${l.buyer}** (${l.destination_market}): Ship via **${l.carrier}** at **$${l.cost_per_ton}/ton** (${l.transit_days} days transit).\n`;
      });
    }

    if (responseContent === "") {
      responseContent = "I can help you with **Market Prices**, **Crop Rotation**, and **Logistics**. \n\nTry asking: 'What are the almond prices in California?' or 'Who is buying corn in the Midwest?'";
    } else {
      // Add the standard footer
      responseContent += `\n### Implementation Checklist\n\n- [ ] Verify soil moisture before planting.\n- [ ] Lock in price with buyer if > $${newContext.market?.[0]?.price || 'target'}.\n- [ ] Schedule transport 3 days in advance.`;
    }

    setContextData(newContext);
    setMessages(prev => [...prev, { role: "assistant", content: responseContent, timestamp: new Date() }]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-soil-dark bg-transparent">
      {/* Left Panel: Chat Interface */}
      <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-soil-dark bg-soil-light/90 backdrop-blur-sm relative z-10">
        <div className="p-4 border-b border-soil-dark flex items-center gap-3 bg-moss-green text-white">
          <div className="w-10 h-10 bg-white p-1 border border-soil-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <img src="/images/agri-logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter uppercase">AgriIntel</h1>
            <p className="text-xs font-mono opacity-80">v1.0.0 // ONLINE</p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-4 border border-soil-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    msg.role === 'user' 
                      ? 'bg-white text-soil-dark' 
                      : 'bg-soil-light text-soil-dark'
                  }`}
                >
                  <div className="text-[10px] font-mono mb-2 opacity-50 uppercase tracking-widest">
                    {msg.role === 'user' ? 'Operator' : 'System_Agent'} // {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="prose prose-sm max-w-none font-mono leading-relaxed">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neon-lime text-soil-dark px-3 py-1 text-xs font-mono border border-soil-dark animate-pulse">
                  PROCESSING_QUERY...
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
              <div className="text-xs font-mono text-soil-dark/60">SYSTEM STATUS</div>
              <div className="text-lg font-bold text-neon-lime bg-soil-dark px-2 inline-block">OPTIMAL</div>
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
                {contextData.market ? (
                  <div className="space-y-3">
                    {contextData.market.map((m) => (
                      <div key={m.id} className="flex justify-between items-center border-b border-dashed border-soil-dark/30 pb-2 last:border-0">
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
                {contextData.rotation ? (
                  <div className="space-y-3">
                    {contextData.rotation.map((r) => (
                      <div key={r.id} className="bg-soil-light p-2 border border-soil-dark">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">{r.previous_crop} → {r.next_crop}</span>
                          <span className={`px-1 text-xs ${r.compatibility.includes('High') ? 'bg-neon-lime text-soil-dark' : 'bg-safety-orange text-white'}`}>
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
                {contextData.logistics ? (
                  <div className="space-y-4">
                    {contextData.logistics.map((l) => (
                      <div key={l.id} className="relative pl-4 border-l-2 border-moss-green">
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

            {/* Active Alerts / Benchmarks */}
            <Card className="bg-soil-dark text-soil-light border border-soil-dark shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] rounded-none md:col-span-2 lg:col-span-3">
              <CardHeader className="border-b border-soil-light/20 pb-2">
                <CardTitle className="flex items-center gap-2 text-lg uppercase text-neon-lime">
                  <AlertTriangle className="w-5 h-5" /> System Alerts & Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 font-mono text-sm grid md:grid-cols-3 gap-4">
                <div className="border border-neon-lime/30 p-3">
                  <div className="text-xs text-neon-lime mb-1">WEATHER ALERT</div>
                  <div>Heavy rainfall expected in Midwest region. Delay planting by 48h.</div>
                </div>
                <div className="border border-neon-lime/30 p-3">
                  <div className="text-xs text-neon-lime mb-1">MARKET OPPORTUNITY</div>
                  <div>Almond demand in Asia markets up 15% WoW.</div>
                </div>
                <div className="border border-neon-lime/30 p-3">
                  <div className="text-xs text-neon-lime mb-1">BENCHMARK ROI</div>
                  <div>Top 10% farms in CA achieving 18% margin with drip irrigation.</div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
