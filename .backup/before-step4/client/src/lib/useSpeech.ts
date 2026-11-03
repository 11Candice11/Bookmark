import { useCallback, useEffect, useState } from "react";

/**
 * Reads text aloud with the browser's built-in speech synthesis.
 * `supported` is false in browsers without it, so callers can hide their trigger.
 */
export function useSpeech() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = document.documentElement.lang || "en";
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [supported],
  );

  // Stop talking when the page using this hook goes away.
  useEffect(() => stop, [stop]);

  return { supported, speaking, speak, stop };
}
