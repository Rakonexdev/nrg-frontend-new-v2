import { defineStore } from 'pinia';
export const useCollectionsStore = defineStore('collections', {
  state: () => ({ items: [] }),
  actions: {}
});