import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Lightweight multi-tenancy context loader.
// Resolves the current user's organization (tenant) and whether they own/manage it.
export function useTenant() {
  const [state, setState] = useState({ user: null, org: null, isOwner: false, loading: true });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await base44.auth.me();
        let org = null;
        if (user?.organization_id) {
          const orgs = await base44.entities.Organization.filter({ id: user.organization_id });
          org = orgs?.[0] || null;
        }
        if (!org && user?.email) {
          const owned = await base44.entities.Organization.filter({ owner_email: user.email });
          org = owned?.[0] || null;
        }
        if (active) {
          setState({
            user,
            org,
            isOwner: !!org && (org.owner_email === user?.email || user?.org_role === 'owner'),
            loading: false,
          });
        }
      } catch {
        if (active) setState({ user: null, org: null, isOwner: false, loading: false });
      }
    })();
    return () => { active = false; };
  }, []);

  return state;
}