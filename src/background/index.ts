import { closeWebSocket, initializeWebSocket, isWebSocketConnected } from "../services/websocket";
import { tabTracing } from "../services/tabTracking";

console.log('Background script loaded');

tabTracing();

let reconnectInterval: NodeJS.Timeout | null = null;

function startReconnectLoop() {
  if (reconnectInterval) return;
  reconnectInterval = setInterval(() => {
    if (!isWebSocketConnected()) {
      console.log('[Background] Attempting to reconnect WebSocket...');
      initializeWebSocket();
    }
  }, 15000);
}

function stopReconnectLoop() {
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  initializeWebSocket();
  startReconnectLoop();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('browser started');
  initializeWebSocket();
  startReconnectLoop();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LOGIN_SUCCESS'){
    initializeWebSocket();
    startReconnectLoop();
  } else if (message.type === 'LOGOUT') {
    closeWebSocket();
    stopReconnectLoop();
  } else if (message.type === 'POPUP_OPENED') {
    initializeWebSocket();
    startReconnectLoop();
  }
  return true;
});