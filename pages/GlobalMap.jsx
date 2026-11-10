import React, { useEffect, useRef, useState } from 'react';
import { Search, Globe, Map, Radio } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

const RAMPS = [
  { id: 1, name: 'Johannesburg Primary', city: 'Johannesburg', country: 'South Africa', status: 'active', currencies: ['ZAR','USDT','USD'], routes: ['ZAR>USDT','USDT>ZAR','ZAR>USD'], partner: 'Standard Bank', lat: -26.2, lng: 28.0 },
  { id: 2, name: 'Cape Town Gateway', city: 'Cape Town', country: 'South Africa', status: 'active', currencies: ['ZAR','USDT'], routes: ['ZAR>USDT'], partner: 'Nedbank', lat: -33.9, lng: 18.4 },
  { id: 3, name: 'Nairobi Hub', city: 'Nairobi', country: 'Kenya', status: 'active', currencies: ['KES','USDT','USD'], routes: ['KES>USDT','USDT>KES','KES>USD'], partner: 'M-Pesa Business', lat: -1.3, lng: 36.8 },
  { id: 4, name: 'Lagos Off-Ramp', city: 'Lagos', country: 'Nigeria', status: 'maintenance', currencies: ['NGN','USDT'], routes: ['USDT>NGN'], partner: 'GTBank', lat: 6.5, lng: 3.4 },
  { id: 5, name: 'Dubai DIFC Node', city: 'Dubai', country: 'UAE', status: 'active', currencies: ['AED','USDT','USD'], routes: ['AED>USDT','USDT>AED','AED>USD'], partner: 'Emirates NBD', lat: 25.2, lng: 55.3 },
  { id: 6, name: 'Accra Exchange Node', city: 'Accra', country: 'Ghana', status: 'active', currencies: ['GHS','USDT','USD'], routes: ['GHS>USDT','USDT>GHS'], partner: 'MTN MoMo', lat: 5.6, lng: -0.2 },
  { id: 7, name: 'London Corridor', city: 'London', country: 'UK', status: 'active', currencies: ['GBP','USDT','USD'], routes: ['GBP>USDT','USDT>GBP'], partner: 'Barclays', lat: 51.5, lng: -0.1 },
  { id: 8, name: 'Singapore Node', city: 'Singapore', country: 'Singapore', status: 'active', currencies: ['SGD','USDT','USD'], routes: ['SGD>USDT','USDT>SGD'], partner: 'DBS Bank', lat: 1.35, lng: 103.8 },
];

const statusColors = { active: 'bg-green-500/20 text-green-400', maintenance: 'bg-yellow-500/20 text-yellow-400', offline: 'bg-red-500/20 text-red-400' };

function GlobeView({ ramps, selected, onSelect }) {
  const mountRef = useRef(null);
  const sceneRef = useRef({});

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 2.8;

    // Globe
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const mat = new THREE.MeshPhongMaterial({ color: 0x0a1628, emissive: 0x071020, shininess: 20 });
    const globe = new THREE.Mesh(geo, mat);
    scene.add(globe);

    // Grid lines
    const gridMat = new THREE.LineBasicMaterial({ color: 0x1a3050, transparent: true, opacity: 0.4 });
    for (let lat = -80; lat <= 80; lat += 20) {
      const pts = [];
      for (let lng = 0; lng <= 360; lng += 2) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = lng * Math.PI / 180;
        pts.push(new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)));
      }
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    for (let lng = 0; lng < 360; lng += 20) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 2) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = lng * Math.PI / 180;
        pts.push(new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)));
      }
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }

    // Atmosphere glow
    const atmGeo = new THREE.SphereGeometry(1.06, 64, 64);
    const atmMat = new THREE.MeshPhongMaterial({ color: 0x0066cc, transparent: true, opacity: 0.07, side: THREE.FrontSide });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    // Lights
    scene.add(new THREE.AmbientLight(0x334466, 0.8));
    const sun = new THREE.DirectionalLight(0x88aaff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    // Ramp markers
    const markerGeo = new THREE.SphereGeometry(0.025, 8, 8);
    ramps.forEach(r => {
      const color = r.status === 'active' ? 0xcfff04 : r.status === 'maintenance' ? 0xffaa00 : 0xff4444;
      const mMat = new THREE.MeshBasicMaterial({ color });
      const phi = (90 - r.lat) * Math.PI / 180;
      const theta = (r.lng + 180) * Math.PI / 180;
      const m = new THREE.Mesh(markerGeo, mMat);
      m.position.set(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
      m.userData = { rampId: r.id };
      scene.add(m);

      // Pulse ring
      const rGeo = new THREE.RingGeometry(0.03, 0.04, 16);
      const rMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(m.position);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      scene.add(ring);
    });

    // Draw routes
    const routePairs = [[0,2],[1,4],[2,3],[4,6],[5,6],[6,7]];
    const lineMat = new THREE.LineBasicMaterial({ color: 0xcfff04, transparent: true, opacity: 0.25 });
    routePairs.forEach(([a, b]) => {
      const ra = ramps[a], rb = ramps[b];
      if (!ra || !rb) return;
      const pts = [];
      for (let t = 0; t <= 1; t += 0.02) {
        const phiA = (90 - ra.lat) * Math.PI / 180, thA = (ra.lng + 180) * Math.PI / 180;
        const phiB = (90 - rb.lat) * Math.PI / 180, thB = (rb.lng + 180) * Math.PI / 180;
        const vA = new THREE.Vector3(Math.sin(phiA) * Math.cos(thA), Math.cos(phiA), Math.sin(phiA) * Math.sin(thA));
        const vB = new THREE.Vector3(Math.sin(phiB) * Math.cos(thB), Math.cos(phiB), Math.sin(phiB) * Math.sin(thB));
        const v = vA.clone().lerp(vB, t).normalize().multiplyScalar(1.02 + Math.sin(Math.PI * t) * 0.08);
        pts.push(v);
      }
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    });

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starPos = [];
    for (let i = 0; i < 2000; i++) {
      starPos.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6 })));

    // Mouse drag
    let isDragging = false, prevMouse = { x: 0, y: 0 };
    const onDown = e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; };
    const onUp = () => { isDragging = false; };
    const onMove = e => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x, dy = e.clientY - prevMouse.y;
      globe.rotation.y += dx * 0.005;
      globe.rotation.x += dy * 0.005;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) globe.rotation.y += 0.002;
      scene.children.forEach(c => { if (c.userData.rampId) { c.rotation.y += 0.01; } });
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = { renderer, animId };
    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}

export default function GlobalMap() {
  const [view, setView] = useState('globe');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = RAMPS.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.country.toLowerCase().includes(search.toLowerCase()) ||
    r.currencies.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Global Map</h1>
          <p className="text-sm text-muted-foreground mt-1">Ramp network & corridors</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={view === 'globe' ? 'default' : 'outline'} onClick={() => setView('globe')} className={view === 'globe' ? 'bg-primary text-primary-foreground' : ''}>
            <Globe className="w-4 h-4 mr-1" /> Globe
          </Button>
          <Button size="sm" variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')} className={view === 'list' ? 'bg-primary text-primary-foreground' : ''}>
            <Map className="w-4 h-4 mr-1" /> List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Globe / Map */}
        <div className="lg:col-span-2">
          {view === 'globe' ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ height: 480 }}>
              <GlobeView ramps={RAMPS} selected={selected} onSelect={setSelected} />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-4" style={{ minHeight: 480 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map(r => (
                  <div key={r.id} onClick={() => setSelected(r.id === selected ? null : r.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selected === r.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <Badge className={`text-[10px] ${statusColors[r.status]}`}>{r.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.city}, {r.country}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {r.currencies.map(c => <span key={c} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{c}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search ramps..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Legend</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-400" /><span className="text-xs text-muted-foreground">Active</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="text-xs text-muted-foreground">Offline</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="text-xs text-muted-foreground">Maintenance</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-[1px] bg-primary/60" /><span className="text-xs text-muted-foreground">Active route</span></div>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filtered.map(r => (
              <div key={r.id} onClick={() => setSelected(r.id === selected ? null : r.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${selected === r.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-card'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.city}, {r.country}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{r.currencies.join(' | ')}</p>
                  </div>
                  <Badge className={`text-[10px] shrink-0 ${statusColors[r.status]}`}>{r.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}