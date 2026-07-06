"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceInputState } from "@/lib/types";
import { Button } from "./Button";
import { Card } from "./Card";

interface SpeechRecognitionEventLike {
  results: {
    length: number;
    [index: number]: { [index: number]: { transcript: string } };
  };
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface VoiceInputProps {
  onApply: (text: string) => void;
}

export function VoiceInput({ onApply }: VoiceInputProps) {
  const [state, setState] = useState<VoiceInputState>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognition =
      w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState("unsupported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const parts: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        parts.push(event.results[i][0].transcript);
      }
      setTranscript(parts.join(" ").trim());
      setState("done");
    };

    recognition.onerror = () => {
      setErrorMessage("Не удалось распознать речь. Попробуйте ещё раз.");
      setState("error");
    };

    recognition.onend = () => {
      setState((prev) => (prev === "listening" ? "done" : prev));
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setErrorMessage("");
    setState("listening");
    try {
      recognitionRef.current.start();
    } catch {
      setErrorMessage("Микрофон занят или недоступен.");
      setState("error");
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState("done");
  }, []);

  const handleClear = () => {
    setTranscript("");
    setErrorMessage("");
    setState("idle");
  };

  const handleApply = () => {
    if (transcript.trim()) {
      onApply(transcript.trim());
    }
  };

  if (state === "unsupported") {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <p className="text-sm text-amber-800">
          Голосовой ввод недоступен в этом браузере. Вы можете заполнить форму
          вручную.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-amber-200 bg-amber-50/30">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {state === "listening" ? (
          <Button variant="secondary" onClick={stopListening}>
            ⏹ Остановить
          </Button>
        ) : (
          <Button variant="secondary" onClick={startListening}>
            🎙️ Заполнить голосом
          </Button>
        )}
        {state === "listening" && (
          <span className="animate-pulse text-sm font-medium text-amber-700">
            Слушаю…
          </span>
        )}
      </div>

      <p className="mb-3 text-xs text-amber-700/70">
        Например: «Нас двое взрослых и двое детей, нужно бюджетное меню на пять
        дней, завтраки и ужины. Муж четыре дня обедает на работе…»
      </p>

      {errorMessage && (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      {transcript && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium text-amber-700">
            Распознанный текст:
          </p>
          <p className="rounded-lg bg-white p-3 text-sm text-amber-900">
            {transcript}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={handleApply}
          disabled={!transcript.trim()}
        >
          Применить к форме
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Очистить
        </Button>
      </div>
    </Card>
  );
}
