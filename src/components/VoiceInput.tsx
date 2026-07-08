"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceInputState } from "@/lib/types";
import { Button } from "./Button";
import { Card } from "./Card";

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
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
  const shouldKeepListeningRef = useRef(false);
  const finalTranscriptRef = useRef("");

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
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const phrase = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${phrase}`.trim();
        } else {
          interim += ` ${phrase}`;
        }
      }
      setTranscript(`${finalTranscriptRef.current}${interim}`.trim());
    };

    recognition.onerror = () => {
      shouldKeepListeningRef.current = false;
      setErrorMessage("Не удалось распознать речь. Попробуйте ещё раз.");
      setState("error");
    };

    recognition.onend = () => {
      if (shouldKeepListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          shouldKeepListeningRef.current = false;
          setErrorMessage("Микрофон занят или недоступен.");
          setState("error");
          return;
        }
      }
      setState((prev) => (prev === "listening" ? "done" : prev));
    };

    recognitionRef.current = recognition;

    return () => {
      shouldKeepListeningRef.current = false;
      recognition.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldKeepListeningRef.current = true;
    finalTranscriptRef.current = "";
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
    shouldKeepListeningRef.current = false;
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
            Распознанный текст (можно поправить):
          </p>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-amber-200 bg-white p-3 text-sm text-amber-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
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
