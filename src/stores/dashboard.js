import { defineStore } from 'pinia';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {
      total_staff: 0,
      expiring_qid: 0,
      expiring_passport: 0,
      renewing_contracts: 0,
      total_collected: 0,
      total_pending: 0,
      total_profit: 0,
      pending_docs_count: 0
    },
    showMiniStats: false,
    
    contractStats: {
      total_paid: 0,
      total_pending: 0,
      total_contract_profit: 0,
      total_overheads: 0
    },
    showContractMiniStats: false,

    expenseStats: {
      this_month: 0,
      this_month_employee: 0,
      this_month_personal_due: 0,
      this_month_company: 0
    },
    showExpenseMiniStats: false
  }),
  actions: {
    setStats(newStats) {
      this.stats = { ...this.stats, ...newStats };
    },
    setShowMiniStats(val) {
      this.showMiniStats = val;
    },
    setContractStats(newStats) {
      this.contractStats = { ...this.contractStats, ...newStats };
    },
    setShowContractMiniStats(val) {
      this.showContractMiniStats = val;
    },
    setExpenseStats(newStats) {
      this.expenseStats = { ...this.expenseStats, ...newStats };
    },
    setShowExpenseMiniStats(val) {
      this.showExpenseMiniStats = val;
    }
  }
});