import React from 'react';
import { useOutletContext } from 'react-router-dom';
import LiveRiskDashboard from '../components/risk/LiveRiskDashboard';
import CARFErrorLog from '../components/risk/CARFErrorLog';
import ReportGenerator from '../components/risk/ReportGenerator';

export default function RiskRegulatory() {
  const { user } = useOutletContext();

  return (
    <div className="space-y-5 pt-8 lg:pt-0">
      <div>
        <h1 className="text-xl font-bold text-foreground">Risk & Regulatory Reporting</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Compliance monitoring, CARF validation, and regulatory payload generation</p>
      </div>

      {/* Top 30%: Live Risk Dashboard */}
      <LiveRiskDashboard />

      {/* Middle: CARF Error Log */}
      <CARFErrorLog />

      {/* Bottom: Report Generator */}
      <ReportGenerator />
    </div>
  );
}