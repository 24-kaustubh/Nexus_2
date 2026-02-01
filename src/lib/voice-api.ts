// src/lib/voice-api.ts

const API_BASE_URL = "http://localhost:8000";

let voiceWs: WebSocket | null = null;
let mediaRecorder: MediaRecorder | null = null;
let audioContext: AudioContext | null = null;

export async function initializeVoiceWebSocket(userId: string = "anonymous"): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    try {
      voiceWs = new WebSocket(
        `ws://localhost:8000/api/v1/ws/voice/${userId}`
      );

      voiceWs.onopen = () => {
        console.log("✅ Voice WebSocket connected");
        resolve(voiceWs!);
      };

      voiceWs.onerror = (error) => {
        console.error("❌ Voice WebSocket error:", error);
        reject(error);
      };

      voiceWs.onclose = () => {
        console.log("Voice WebSocket closed");
        voiceWs = null;
      };
    } catch (error) {
      reject(error);
    }
  });
}

export async function startVoiceRecording(): Promise<{
  stop: () => Promise<void>;
  onAudioData: (callback: (data: Uint8Array) => void) => void;
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    mediaRecorder = new MediaRecorder(stream, { mimeType });

    let audioDataCallbacks: ((data: Uint8Array) => void)[] = [];
    let audioChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          audioDataCallbacks.forEach(cb => cb(uint8Array));
        };
        reader.readAsArrayBuffer(event.data);
      }
    };

    mediaRecorder.start(100);

    return {
      stop: async () => {
        return new Promise((resolve) => {
          if (mediaRecorder) {
            mediaRecorder.onstop = () => {
              stream.getTracks().forEach(track => track.stop());
              mediaRecorder = null;
              resolve();
            };
            mediaRecorder.stop();
          } else {
            resolve();
          }
        });
      },
      onAudioData: (callback) => {
        audioDataCallbacks.push(callback);
      },
    };
  } catch (error) {
    console.error("Microphone access error:", error);
    throw error;
  }
}

export async function sendAudioData(audioData: Uint8Array): Promise<void> {
  if (!voiceWs || voiceWs.readyState !== WebSocket.OPEN) {
    throw new Error("Voice WebSocket not connected");
  }

  try {
    const binaryString = String.fromCharCode.apply(null, Array.from(audioData));
    const base64Audio = btoa(binaryString);

    voiceWs.send(
      JSON.stringify({
        type: "audio",
        content: base64Audio,
      })
    );
  } catch (error) {
    console.error("Error sending audio data:", error);
    throw error;
  }
}

export function onVoiceResponse(
  callback: (response: {
    type: "transcript" | "audio" | "text";
    content: string;
  }) => void
): () => void {
  if (!voiceWs) {
    throw new Error("Voice WebSocket not initialized");
  }

  const messageHandler = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📨 Voice response:", data);
      callback(data);
    } catch (error) {
      console.error("Parse error:", error);
    }
  };

  voiceWs.addEventListener("message", messageHandler);

  return () => {
    if (voiceWs) {
      voiceWs.removeEventListener("message", messageHandler);
    }
  };
}

export function closeVoiceWebSocket(): void {
  if (voiceWs) {
    voiceWs.close();
    voiceWs = null;
  }
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}
