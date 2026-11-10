import React, { Suspense, lazy } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/lib/AuthContext'
import AppLayout from './components/layout/AppLayout'

const queryClient = new QueryClient()

// Direct import of PitchDeck for instant loading & Trailer route
import PitchDeck from './pages/PitchDeck'

// Lazy loaded modules
const Dashboard = lazy(() => import('./pages/Dashboard'))
const LiveRates = lazy(() => import('./pages/LiveRates'))
const TradeTickets = lazy(() => import('./pages/TradeTickets'))
const TicketFormPage = lazy(() => import('./pages/TicketFormPage'))
const TicketDetailPage = lazy(() => import('./pages/TicketDetailPage'))
const Clients = lazy(() => import('./pages/Clients'))
const Leads = lazy(() => import('./pages/Leads'))
const Partners = lazy(() => import('./pages/Partners'))
const Arbitrage = lazy(() => import('./pages/Arbitrage'))
const FileCabinet = lazy(() => import('./pages/FileCabinet'))
const News = lazy(() => import('./pages/News'))
const MyTickets = lazy(() => import('./pages/MyTickets'))
const MyFiles = lazy(() => import('./pages/MyFiles'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const TradingAdvisor = lazy(() => import('./pages/TradingAdvisor'))
const RiskRegulatory = lazy(() => import('./pages/RiskRegulatory'))
const CommunicationsHub = lazy(() => import('./pages/CommunicationsHub'))
const GlobalMap = lazy(() => import('./pages/GlobalMap'))
const Ramps = lazy(() => import('./pages/Ramps'))
const Trades = lazy(() => import('./pages/Trades'))
const Exchange = lazy(() => import('./pages/Exchange'))
const PaymentRails = lazy(() => import('./pages/PaymentRails'))
const AuditLog = lazy(() => import('./pages/AuditLog'))
const Commissions = lazy(() => import('./pages/Commissions'))
const Organizations = lazy(() => import('./pages/Organizations'))
const OrgSettings = lazy(() => import('./pages/OrgSettings'))
const ClientOnboarding = lazy(() => import('./pages/ClientOnboarding'))
const PlatformOverview = lazy(() => import('./pages/PlatformOverview'))

const FallbackLoader = () => (
  <div className="flex items-center justify-center py-20 text-slate-400 font-mono text-sm">
    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
    Loading Module...
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Direct Trailer Route */}
            <Route path="/trailer" element={<PitchDeck autoPlayTrailer={true} standalone={true} />} />
            <Route path="/deck" element={<PitchDeck standalone={true} />} />

            {/* Terminal Shell */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Suspense fallback={<FallbackLoader />}><Dashboard /></Suspense>} />
              <Route path="/trades" element={<Suspense fallback={<FallbackLoader />}><Trades /></Suspense>} />
              <Route path="/tickets" element={<Suspense fallback={<FallbackLoader />}><TradeTickets /></Suspense>} />
              <Route path="/tickets/new" element={<Suspense fallback={<FallbackLoader />}><TicketFormPage /></Suspense>} />
              <Route path="/tickets/:id" element={<Suspense fallback={<FallbackLoader />}><TicketDetailPage /></Suspense>} />
              <Route path="/tickets/:id/edit" element={<Suspense fallback={<FallbackLoader />}><TicketFormPage /></Suspense>} />
              <Route path="/clients" element={<Suspense fallback={<FallbackLoader />}><Clients /></Suspense>} />
              <Route path="/onboarding" element={<Suspense fallback={<FallbackLoader />}><ClientOnboarding /></Suspense>} />
              <Route path="/leads" element={<Suspense fallback={<FallbackLoader />}><Leads /></Suspense>} />
              <Route path="/partners" element={<Suspense fallback={<FallbackLoader />}><Partners /></Suspense>} />
              <Route path="/arbitrage" element={<Suspense fallback={<FallbackLoader />}><Arbitrage /></Suspense>} />
              <Route path="/exchange" element={<Suspense fallback={<FallbackLoader />}><Exchange /></Suspense>} />
              <Route path="/ramps" element={<Suspense fallback={<FallbackLoader />}><Ramps /></Suspense>} />
              <Route path="/global-map" element={<Suspense fallback={<FallbackLoader />}><GlobalMap /></Suspense>} />
              <Route path="/payment-rails" element={<Suspense fallback={<FallbackLoader />}><PaymentRails /></Suspense>} />
              <Route path="/risk" element={<Suspense fallback={<FallbackLoader />}><RiskRegulatory /></Suspense>} />
              <Route path="/commissions" element={<Suspense fallback={<FallbackLoader />}><Commissions /></Suspense>} />
              <Route path="/communications" element={<Suspense fallback={<FallbackLoader />}><CommunicationsHub /></Suspense>} />
              <Route path="/files" element={<Suspense fallback={<FallbackLoader />}><FileCabinet /></Suspense>} />
              <Route path="/reports" element={<Suspense fallback={<FallbackLoader />}><Reports /></Suspense>} />
              <Route path="/news" element={<Suspense fallback={<FallbackLoader />}><News /></Suspense>} />
              <Route path="/advisor" element={<Suspense fallback={<FallbackLoader />}><TradingAdvisor /></Suspense>} />
              <Route path="/my-tickets" element={<Suspense fallback={<FallbackLoader />}><MyTickets /></Suspense>} />
              <Route path="/my-files" element={<Suspense fallback={<FallbackLoader />}><MyFiles /></Suspense>} />
              <Route path="/organizations" element={<Suspense fallback={<FallbackLoader />}><Organizations /></Suspense>} />
              <Route path="/org-settings" element={<Suspense fallback={<FallbackLoader />}><OrgSettings /></Suspense>} />
              <Route path="/pitch" element={<PitchDeck />} />
              <Route path="/overview" element={<Suspense fallback={<FallbackLoader />}><PlatformOverview /></Suspense>} />
              <Route path="/rates" element={<Suspense fallback={<FallbackLoader />}><LiveRates /></Suspense>} />
              <Route path="/audit-log" element={<Suspense fallback={<FallbackLoader />}><AuditLog /></Suspense>} />
              <Route path="/settings" element={<Suspense fallback={<FallbackLoader />}><Settings /></Suspense>} />
            </Route>
            <Route path="*" element={<PitchDeck standalone={true} />} />
          </Routes>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  )
}
