// Create this file as: src/lib/api.ts

const API_BASE_URL = "http://localhost:8000";

// WebSocket connection
let ws: WebSocket | null = null;
let messageHandlers: ((data: any) => void)[] = [];

export function createWebSocket(userId: string = "anonymous"): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    try {
      ws = new WebSocket(
        `ws://localhost:8000/api/v1/ws/chat/${userId}`
      );

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        resolve(ws!);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Message received:", data);
          
          // Trigger all registered handlers
          messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error("Parse error:", error, event.data);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        reject(error);
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        ws = null;
      };
    } catch (error) {
      reject(error);
    }
  });
}

export function getWebSocket(): WebSocket | null {
  return ws;
}

export function registerMessageHandler(handler: (data: any) => void) {
  messageHandlers.push(handler);
  return () => {
    messageHandlers = messageHandlers.filter(h => h !== handler);
  };
}

export async function sendMessage(message: string): Promise<string> {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket not connected");
  }

  return new Promise((resolve, reject) => {
    try {
      // Send message as JSON
      ws!.send(
        JSON.stringify({
          message: message,
          type: "message",
        })
      );

      // Wait for response
      const unsubscribe = registerMessageHandler((response) => {
        unsubscribe();
        if (response.message) {
          resolve(response.message);
        } else {
          reject(new Error("Invalid response format"));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        unsubscribe();
        reject(new Error("Message timeout"));
      }, 30000);
    } catch (error) {
      reject(error);
    }
  });
}

export function closeWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}