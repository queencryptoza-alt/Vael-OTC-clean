import React from 'react';

const w = 380;
const h = 200;
const centerX = w / 2;
const centerY = h / 2;
const radius = 92;

// Simple continent outlines (scaled to globe view)
const continents = {
  africa: 'M 185 60 L 192 55 L 198 58 L 205 62 L 210 75 L 208 85 L 212 95 L 210 108 L 205 118 L 198 130 L 190 136 L 185 140 L 178 138 L 172 130 L 168 118 L 165 108 L 167 95 L 170 82 L 175 68 Z',
  europe: 'M 175 30 L 180 25 L 188 22 L 198 20 L 208 22 L 215 28 L 218 35 L 215 45 L 210 50 L 202 52 L 195 50 L 188 45 L 183 38 L 178 35 Z',
  asia: 'M 218 20 L 228 18 L 240 20 L 255 25 L 268 30 L 278 38 L 285 45 L 288 52 L 285 58 L 278 62 L 268 60 L 258 55 L 248 50 L 238 45 L 228 40 L 220 35 Z',
  northAmerica: 'M 45 28 L 55 20 L 68 15 L 82 18 L 95 22 L 105 30 L 112 38 L 115 45 L 112 52 L 105 55 L 92 52 L 78 48 L 65 42 L 52 38 Z',
  southAmerica: 'M 85 70 L 90 65 L 98 62 L 105 65 L 110 72 L 112 82 L 110 92 L 105 102 L 98 108 L 90 105 L 85 98 L 82 88 L 83 78 Z',
  australia: 'M 280 105 L 288 102 L 295 105 L 298 112 L 295 120 L 288 125 L 280 122 L 276 115 L 277 108 Z',
};

const normalize = (lon, lat) => {
  const x = ((lon + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return [x, y];
};

// Trade routes with volume
const routes = [
  { from: 'Johannesburg', to: 'London', fromCoords: [28.05, -26.20], toCoords: [-0.13, 51.51], volume: 'R 4.2M', active: true },
  { from: 'Cape Town', to: 'Dubai', fromCoords: [18.42, -33.92], toCoords: [55.27, 25.20], volume: 'R 2.8M', active: true },
  { from: 'Johannesburg', to: 'Singapore', fromCoords: [28.05, -26.20], toCoords: [103.82, 1.35], volume: 'R 3.5M', active: true },
  { from: 'Johannesburg', to: 'New York', fromCoords: [28.05, -26.20], toCoords: [-74.01, 40.71], volume: 'R 1.9M', active: false },
  { from: 'Cape Town', to: 'Mauritius', fromCoords: [18.42, -33.92], toCoords: [57.55, -20.35], volume: 'R 0.8M', active: true },
  { from: 'Johannesburg', to: 'Hong Kong', fromCoords: [28.05, -26.20], toCoords: [114.17, 22.32], volume: 'R 5.1M', active: true },
  { from: 'Cape Town', to: 'Zurich', fromCoords: [18.42, -33.92], toCoords: [8.54, 47.38], volume: 'R 1.2M', active: false },
  { from: 'Johannesburg', to: 'Sydney', fromCoords: [28.05, -26.20], toCoords: [151.21, -33.87], volume: 'R 0.6M', active: true },
];

// Arbitrage opportunities (route + spread)
const arbOpps = [
  { route: 'USDT → ZAR EFT', spread: '2.8%', from: 'Binance P2P', to: 'Local EFT', volume: 'R 1.2M', coords: [[28.05, -26.20], [30.0, -29.0]] },
  { route: 'USDT → AED', spread: '3.2%', from: 'SA Ramp', to: 'DXB OTC', volume: 'R 2.5M', coords: [[28.05, -26.20], [55.27, 25.20]] },
  { route: 'BTC → USDT', spread: '1.5%', from: 'Luno', to: 'Binance', volume: 'R 0.9M', coords: [[18.42, -33.92], [28.05, -26.20]] },
  { route: 'ZAR → USDT → AED', spread: '4.1%', from: 'SA Bank', to: 'DXB OTC', volume: 'R 3.8M', coords: [[28.05, -26.20], [55.27, 25.20]] },
];

// On/off ramps - SA banking + crypto exchanges
const ramps = [
  { name: 'Luno', type: 'exchange', coords: [18.42, -33.92], city: 'CPT' },
  { name: 'Binance SA', type: 'exchange', coords: [28.05, -26.20], city: 'JNB' },
  { name: 'Standard Bank', type: 'bank', coords: [28.05, -26.20], city: 'JNB' },
  { name: 'FNB', type: 'bank', coords: [18.42, -33.92], city: 'CPT' },
  { name: 'Investec', type: 'bank', coords: [28.05, -26.20], city: 'JNB' },
  { name: 'Payfast', type: 'gateway', coords: [18.42, -33.92], city: 'CPT' },
  { name: 'Binance DXB', type: 'exchange', coords: [55.27, 25.20], city: 'DXB' },
  { name: 'Kraken', type: 'exchange', coords: [-0.13, 51.51], city: 'LON' },
];

const hubs = [
  { name: 'JNB', coords: [28.05, -26.20] },
  { name: 'CPT', coords: [18.42, -33.92] },
  { name: 'LON', coords: [-0.13, 51.51] },
  { name: 'DXB', coords: [55.27, 25.20] },
  { name: 'SGP', coords: [103.82, 1.35] },
  { name: 'NYC', coords: [-74.01, 40.71] },
  { name: 'HKG', coords: [114.17, 22.32] },
  { name: 'SYD', coords: [151.21, -33.87] },
  { name: 'ZRH', coords: [8.54, 47.38] },
  { name: 'MRU', coords: [57.55, -20.35] },
];

export default function GlobeVisual() {
  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl" style={{ transform: 'scale(0.8)' }} />

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <radialGradient id="globeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(67, 100%, 51%)" stopOpacity="0.06" />
            <stop offset="70%" stopColor="hsl(67, 100%, 51%)" stopOpacity="0.02" />
            <stop offset="100%" stopColor="hsl(67, 100%, 51%)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="arbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(38, 92%, 50%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(38, 92%, 50%)" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="arbGlowFilter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Globe background */}
        <circle cx={centerX} cy={centerY} r={radius} fill="url(#globeGrad)" stroke="hsl(67, 100%, 51%)" strokeWidth="0.5" strokeOpacity="0.25" />

        {/* Continents */}
        {Object.values(continents).map((path, i) => (
          <path key={i} d={path} fill="hsl(67, 100%, 51%)" fillOpacity="0.06" stroke="hsl(67, 100%, 51%)" strokeWidth="0.3" strokeOpacity="0.15" />
        ))}

        {/* Grid lines */}
        {[-60, -30, 0, 30, 60].map(lat => (
          <ellipse key={lat} cx={centerX} cy={centerY}
            rx={radius * Math.cos((lat * Math.PI) / 180)} ry={3}
            fill="none" stroke="hsl(67, 100%, 51%)" strokeWidth="0.2" strokeOpacity="0.08"
            transform={`translate(0, ${(lat / 90) * radius * -0.85})`}
          />
        ))}
        {[-120, -60, 0, 60, 120].map(lon => (
          <ellipse key={lon} cx={centerX + (lon / 180) * radius * 0.85} cy={centerY}
            rx={Math.abs(lon) === 90 ? 2 : 6} ry={radius * 0.85}
            fill="none" stroke="hsl(67, 100%, 51%)" strokeWidth="0.2" strokeOpacity="0.08"
            transform={`rotate(${lon * 0.3}, ${centerX + (lon / 180) * radius * 0.85}, ${centerY})`}
          />
        ))}

        {/* Route lines */}
        {routes.filter(r => r.active).map((route, i) => {
          const [x1, y1] = normalize(route.fromCoords[0], route.fromCoords[1]);
          const [x2, y2] = normalize(route.toCoords[0], route.toCoords[1]);
          const midX = (x1 + x2) / 2;
          const midY = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.25;
          const alpha = 0.12 + (i % 3) * 0.08;
          return (
            <g key={`route-${i}`}>
              <path d={`M${x1},${y1} Q${midX},${midY} ${x2},${y2}`}
                fill="none" stroke="hsl(67, 100%, 51%)" strokeWidth={0.5 + (i % 2) * 0.3}
                strokeOpacity={alpha} filter="url(#glow)"
                strokeDasharray={i % 2 === 0 ? undefined : '3 3'}
              />
              <circle cx={x1} cy={y1} r={1.5} fill="hsl(67, 100%, 51%)" opacity="0.5" filter="url(#glow)" />
              <circle cx={x2} cy={y2} r={1.5} fill="hsl(67, 100%, 70%)" opacity="0.5" />
            </g>
          );
        })}

        {/* Arbitrage opportunity routes (animated pulse) */}
        {arbOpps.map((opp, i) => {
          const [x1, y1] = normalize(opp.coords[0][0], opp.coords[0][1]);
          const [x2, y2] = normalize(opp.coords[1][0], opp.coords[1][1]);
          const midX = (x1 + x2) / 2;
          const midY = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.3;
          return (
            <g key={`arb-${i}`}>
              <path d={`M${x1},${y1} Q${midX},${midY} ${x2},${y2}`}
                fill="none" stroke="hsl(38, 92%, 50%)" strokeWidth={1.2 + i * 0.3}
                strokeOpacity="0.5" filter="url(#arbGlowFilter)"
              />
              {/* Spread badge */}
              <circle cx={midX} cy={midY - 8} r={12} fill="hsl(0, 0%, 4%)" stroke="hsl(38, 92%, 50%)" strokeWidth="0.5" opacity="0.9" />
              <text x={midX} y={midY - 4.5} textAnchor="middle" fill="hsl(38, 92%, 50%)" fontSize="7" fontFamily="Figtree" fontWeight="800">
                {opp.spread}
              </text>
            </g>
          );
        })}

        {/* Ramp markers */}
        {ramps.map((ramp, i) => {
          const [x, y] = normalize(ramp.coords[0], ramp.coords[1]);
          const isExchange = ramp.type === 'exchange';
          const isBank = ramp.type === 'bank';
          const offsetY = isExchange ? -6 - (i % 3) * 5 : isBank ? 6 + (i % 3) * 4 : 14 + (i % 3) * 4;
          return (
            <g key={`ramp-${i}`}>
              <line x1={x} y1={y} x2={x} y2={y + offsetY}
                stroke={isExchange ? 'hsl(180, 80%, 50%)' : isBank ? 'hsl(67, 100%, 51%)' : 'hsl(38, 92%, 50%)'}
                strokeWidth="0.3" strokeOpacity="0.5"
              />
              <circle cx={x} cy={y + offsetY} r={2.5}
                fill="hsl(0, 0%, 4%)"
                stroke={isExchange ? 'hsl(180, 80%, 50%)' : isBank ? 'hsl(67, 100%, 51%)' : 'hsl(38, 92%, 50%)'}
                strokeWidth="0.6"
              />
              <text x={x + 4} y={y + offsetY + 1.5}
                fill={isExchange ? 'hsl(180, 80%, 70%)' : isBank ? 'hsl(67, 100%, 70%)' : 'hsl(38, 92%, 70%)'}
                fontSize="4.5" fontFamily="Figtree" fontWeight="600" opacity="0.7"
              >
                {ramp.name}
              </text>
            </g>
          );
        })}

        {/* Hub cities */}
        {hubs.map(city => {
          const [x, y] = normalize(city.coords[0], city.coords[1]);
          return (
            <g key={city.name}>
              <circle cx={x} cy={y} r={2.5} fill="hsl(0, 0%, 4%)" stroke="hsl(67, 100%, 51%)" strokeWidth="0.8" />
              <text x={x + 4} y={y + 1} fill="hsl(67, 100%, 70%)" fontSize="5" fontFamily="Figtree" fontWeight="700" opacity="0.8">
                {city.name}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(5, h - 25)">
          <rect x="0" y="0" width="130" height="22" rx="3" fill="hsl(0, 0%, 4%)" fillOpacity="0.8" stroke="hsl(var(--border))" strokeWidth="0.3" />
          <line x1="6" y1="7" x2="18" y2="7" stroke="hsl(67, 100%, 51%)" strokeWidth="0.8" opacity="0.6" />
          <text x="21" y="9" fill="hsl(67, 100%, 70%)" fontSize="5" fontFamily="Figtree" fontWeight="500">Routes</text>
          <line x1="6" y1="14" x2="18" y2="14" stroke="hsl(38, 92%, 50%)" strokeWidth="0.8" opacity="0.6" />
          <text x="21" y="16" fill="hsl(38, 92%, 70%)" fontSize="5" fontFamily="Figtree" fontWeight="500">Arbitrage</text>
          <circle cx="55" cy="7" r="2" fill="none" stroke="hsl(180, 80%, 50%)" strokeWidth="0.5" />
          <text x="59" y="9" fill="hsl(180, 80%, 70%)" fontSize="5" fontFamily="Figtree" fontWeight="500">Exchanges</text>
          <circle cx="95" cy="7" r="2" fill="none" stroke="hsl(67, 100%, 51%)" strokeWidth="0.5" />
          <text x="99" y="9" fill="hsl(67, 100%, 70%)" fontSize="5" fontFamily="Figtree" fontWeight="500">Banks</text>
        </g>
      </svg>
    </div>
  );
}