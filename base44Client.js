const localStore = {
  get(table) {
    try {
      const data = typeof window !== 'undefined' ? localStorage.getItem(`vael_${table}`) : null;
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  set(table, records) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`vael_${table}`, JSON.stringify(records));
      }
    } catch {}
  },
};

function createEntityHandler(tableName) {
  return {
    async list(sort = '-created_date', limit = 100) {
      return localStore.get(tableName);
    },
    async get(id) {
      return localStore.get(tableName).find(item => item.id === id) || null;
    },
    async filter(conditions = {}, sort = '-created_date') {
      const records = localStore.get(tableName);
      return records.filter(item => {
        return Object.entries(conditions).every(([key, val]) => item[key] === val);
      });
    },
    async create(payload) {
      const record = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rec_${Date.now()}`,
        created_date: new Date().toISOString(),
        ...payload,
      };
      const records = localStore.get(tableName);
      records.unshift(record);
      localStore.set(tableName, records);
      return record;
    },
    async update(id, updates) {
      const records = localStore.get(tableName);
      const idx = records.findIndex(r => r.id === id);
      if (idx !== -1) {
        records[idx] = { ...records[idx], ...updates };
        localStore.set(tableName, records);
        return records[idx];
      }
      return updates;
    },
    async delete(id) {
      const records = localStore.get(tableName).filter(r => r.id !== id);
      localStore.set(tableName, records);
      return true;
    },
  };
}

export const base44 = {
  entities: {
    Client: createEntityHandler('clients'),
    TradeTicket: createEntityHandler('trade_tickets'),
    Beneficiary: createEntityHandler('beneficiaries'),
    Lead: createEntityHandler('leads'),
    Partner: createEntityHandler('partners'),
    SalesAgent: createEntityHandler('sales_agents'),
    CommissionPayout: createEntityHandler('commission_payouts'),
    Organization: createEntityHandler('organizations'),
    FileUpload: createEntityHandler('file_uploads'),
    User: createEntityHandler('user_profiles'),
  },
  auth: {
    async me() {
      return {
        id: 'usr_admin_default',
        email: 'trader@vaelotc.com',
        full_name: 'VAEL Lead Trader',
        role: 'admin',
      };
    },
    async logout() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vael_auth');
        window.location.reload();
      }
    },
    async updateMe(updates) {
      return updates;
    },
    redirectToLogin() {
      if (typeof window !== 'undefined') window.location.href = '/login';
    },
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ file_url: reader.result });
          reader.readAsDataURL(file);
        });
      },
      async SendEmail({ to, subject }) {
        return { success: true };
      },
      async InvokeLLM() {
        return {
          rate: 18.35,
          valid_rate: 18.35,
          xe_rates: [
            { pair: 'USD/ZAR', rate: 18.35, change_24h: 0.15 },
            { pair: 'EUR/ZAR', rate: 19.82, change_24h: -0.22 },
            { pair: 'GBP/ZAR', rate: 23.41, change_24h: 0.08 },
            { pair: 'USDT/ZAR', rate: 18.40, change_24h: 0.25 },
            { pair: 'BTC/ZAR', rate: 1920000, change_24h: 1.8 },
            { pair: 'ETH/ZAR', rate: 62000, change_24h: -0.6 },
          ],
          exchange_rates: [
            { exchange: 'VALR', pair: 'USDT/ZAR', rate: 18.47, change_24h: 0.2 },
            { exchange: 'Luno', pair: 'BTC/ZAR', rate: 1940000, change_24h: 1.4 },
            { exchange: 'Binance SA', pair: 'USDT/ZAR', rate: 18.53, change_24h: 0.3 },
          ],
        };
      },
    },
  },
  analytics: {
    track() {},
  },
  agents: {
    async createConversation() {
      return { id: `conv_${Date.now()}` };
    },
    subscribeToConversation() {
      return () => {};
    },
    async addMessage(conv, { role, content }) {
      return { role, content };
    },
  },
  users: {
    async inviteUser() {
      return { success: true };
    },
  },
};
