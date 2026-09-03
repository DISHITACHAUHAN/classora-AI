export class ClassroomWebSocket {
  constructor(sessionId, onMessageCallback) {
    this.sessionId = sessionId;
    this.onMessageCallback = onMessageCallback;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isClosedManually = false;
    this.connect();
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/classroom/${this.sessionId}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`[Classora WS] Connected to session ${this.sessionId}`);
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(data);
          }
        } catch (err) {
          console.error('[Classora WS] Failed to parse message', err);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[Classora WS] Connection error:', err);
      };

      this.socket.onclose = () => {
        if (!this.isClosedManually && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
          console.log(`[Classora WS] Reconnecting in ${timeout}ms...`);
          setTimeout(() => this.connect(), timeout);
        }
      };
    } catch (e) {
      console.error('[Classora WS] Init error', e);
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect() {
    this.isClosedManually = true;
    if (this.socket) {
      this.socket.close();
    }
  }
}
