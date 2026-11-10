import React, { Suspense, useEffect, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import Sidebar from './Sidebar';
import CryptoTicker from './CryptoTicker';
import BottomTabBar from './BottomTabBar';

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const outlet = useOutlet({ user });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <div className="safe-area-top">
        <CryptoTicker />
      </div>
      <Sidebar user={user} />
      <main className="lg:ml-60 min-h-[calc(100vh-36px)] pb-16 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
                {outlet}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <BottomTabBar user={user} />
    </div>
  );
}