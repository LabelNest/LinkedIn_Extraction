/**
 * @file api.js
 * API Service for LABELNEST LinkedIn Intelligence
 */

import {
  enrichLinkedIn,
  getHistory,
  checkBackendHealth,
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  getLocalHistory,
  saveToLocalHistory,
  clearLocalHistory,
  apiService
} from './api.ts';

export {
  enrichLinkedIn,
  getHistory,
  checkBackendHealth,
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  getLocalHistory,
  saveToLocalHistory,
  clearLocalHistory,
  apiService
};

export default apiService;
