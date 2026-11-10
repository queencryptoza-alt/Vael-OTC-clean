import React from 'react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export default function ClientOnboarding() {
  return (
    <div className="pt-8 lg:pt-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Client Onboarding</h1>
        <p className="text-sm text-muted-foreground mt-1">Guided KYC & business profile setup for new clients</p>
      </div>
      <OnboardingWizard />
    </div>
  );
}