"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Props {
  onGameOver: (score: number) => void;
}

const WORDS = [
  "CRANE","SLATE","STARE","ARISE","LEAST","TRACE","CRATE","SNARE","STALE","PARSE",
  "FLUTE","BRISK","GLOAM","CAULK","QUIRK","PLUMB","SWAMP","FROND","KNELT","CHIVE",
  "BLAZE","CRIMP","DWARF","EPOCH","FJORD","GLYPH","HEIST","INFER","JOUST","KNAVE",
  "LODGE","MIRTH","NYMPH","OPTIC","PLUCK","QUAFF","RENEW","STOIC","TRYST","USURP",
  "VAPID","WINCE","XEROX","YACHT","ZONED","ABBEY","BLIMP","COVEN","DELVE","EMBER",
];

const ALPHABET = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
const MAX_GUESSES = 6;
const WORD_LEN = 5;

type LetterState = "correct" | "present" | "absent" | "empty" | "tbd";

function getTodaysWord(): string {
  const dayIndex = Math.floor(Date.now() / 86400000) % WORDS.length;
  return WORDS[dayIndex];
}

function evaluateGuess(guess: string, target: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LEN).fill("absent");
  const targetArr = target.split("");
  const guessArr  = guess.split("");
  const used      = Array(WORD_LEN).fill(false);

  // First pass: correct positions
  guessArr.forEach((ch, i) => {
    if (ch === targetArr[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  });

  // Second pass: present but wrong position
  guessArr.forEach((ch, i) => {
    if (result[i] === "correct") return;
    const j = targetArr.findIndex((t, ti) => t === ch && !used[ti]);
    if (j !== -1) {
      result[i] = "present";
      used[j] = true;
    }
  });

  return result;
}

const TILE_COLORS: Record<LetterState, { bg: string; border: string; text: string }> = {
  correct: { bg: "rgba(200,241,53,0.25)", border: "rgba(200,241,53,0.8)", text: "#c8f135" },
  present: { bg: "rgba(245,200,66,0.2)",  border: "rgba(245,200,66,0.7)", text: "#f5c842" },
  absent:  { bg: "var(--bg-raised)",       border: "var(--border)",        text: "var(--text-3)" },
  empty:   { bg: "transparent",            border: "var(--border)",        text: "var(--text-1)" },
  tbd:     { bg: "transparent",            border: "var(--border-md)",     text: "var(--text-1)" },
};

export default function WordRushGame({ onGameOver }: Props) {
  const target   = useRef(getTodaysWord());
  const [guesses, setGuesses]   = useState<string[]>([]);
  const [results, setResults]   = useState<LetterState[][]>([]);
  const [current, setCurrent]   = useState("");
  const [shake, setShake]       = useState(false);
  const [won, setWon]           = useState(false);
  const [letterMap, setLetterMap] = useState<Record<string, LetterState>>({});
  const [revealed, setRevealed] = useState<number>(-1); // which guess row is animating

  const isGameOver = won || guesses.length >= MAX_GUESSES;

  // Keyboard input
  useEffect(() => {
    if (isGameOver) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter")      submitGuess();
      else if (e.key === "Backspace") setCurrent((c) => c.slice(0, -1));
      else if (/^[a-zA-Z]$/.test(e.key) && current.length < WORD_LEN)
        setCurrent((c) => (c + e.key).toUpperCase());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const submitGuess = useCallback(() => {
    if (current.length < WORD_LEN) { triggerShake(); return; }
    if (!WORDS.includes(current) && current !== target.current) {
      // Accept any 5-letter input for playability
    }

    const eval_ = evaluateGuess(current, target.current);
    const newGuesses = [...guesses, current];
    const newResults = [...results, eval_];

    setGuesses(newGuesses);
    setResults(newResults);
    setRevealed(newGuesses.length - 1);
    setCurrent("");

    // Update letter map
    setLetterMap((prev) => {
      const next = { ...prev };
      const priority: Record<LetterState, number> = { correct: 3, present: 2, absent: 1, empty: 0, tbd: 0 };
      current.split("").forEach((ch, i) => {
        if (!next[ch] || priority[eval_[i]] > priority[next[ch]]) {
          next[ch] = eval_[i];
        }
      });
      return next;
    });

    const isWin = eval_.every((s) => s === "correct");
    if (isWin) {
      setWon(true);
      setTimeout(() => {
        const score = (MAX_GUESSES - newGuesses.length + 1) * 200;
        onGameOver(score);
      }, 1600);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setTimeout(() => onGameOver(0), 1200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, guesses, results, onGameOver]);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function onKey(key: string) {
    if (isGameOver) return;
    if (key === "ENTER")   submitGuess();
    else if (key === "⌫")  setCurrent((c) => c.slice(0, -1));
    else if (current.length < WORD_LEN) setCurrent((c) => c + key);
  }

  // Build the 6-row grid
  const rows: { letters: string[]; states: LetterState[] }[] = [];
  for (let r = 0; r < MAX_GUESSES; r++) {
    if (r < guesses.length) {
      rows.push({ letters: guesses[r].split(""), states: results[r] });
    } else if (r === guesses.length) {
      const letters = current.padEnd(WORD_LEN, " ").split("");
      const states: LetterState[] = letters.map((l) => l.trim() ? "tbd" : "empty");
      rows.push({ letters, states });
    } else {
      rows.push({ letters: Array(WORD_LEN).fill(" "), states: Array(WORD_LEN).fill("empty") });
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4">

      {/* Score indicator */}
      <div className="w-full flex justify-between text-xs px-1" style={{ color: "var(--text-3)" }}>
        <span>{guesses.length}/{MAX_GUESSES} guesses</span>
        {won && <span style={{ color: "var(--accent)" }}>+{(MAX_GUESSES - guesses.length + 1) * 200} pts</span>}
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-1.5">
        {rows.map((row, ri) => (
          <div key={ri}
               className={`flex gap-1.5 ${ri === guesses.length && shake ? "animate-shake" : ""}`}
               style={ri === guesses.length && shake ? { animation: "shake 0.4s ease" } : {}}>
            {row.letters.map((letter, ci) => {
              const state = row.states[ci];
              const col   = TILE_COLORS[state];
              const delay = ri === revealed ? `${ci * 120}ms` : "0ms";
              return (
                <div key={ci}
                     className="w-12 h-12 flex items-center justify-center font-display font-bold text-lg rounded-lg transition-all"
                     style={{
                       background:   col.bg,
                       border:       `1.5px solid ${col.border}`,
                       color:        col.text,
                       transitionDelay: delay,
                       transform:    ri === revealed ? "scale(1)" : undefined,
                     }}>
                  {letter.trim()}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Game message */}
      {isGameOver && !won && (
        <div className="text-sm font-semibold" style={{ color: "#ff5555" }}>
          The word was <span style={{ color: "var(--accent)" }}>{target.current}</span>
        </div>
      )}
      {won && (
        <div className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
          🎉 Solved in {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}!
        </div>
      )}

      {/* On-screen keyboard */}
      {!isGameOver && (
        <div className="flex flex-col gap-1.5 w-full mt-1">
          {["QWERTYUIOP", "ASDFGHJKL", "⌫ZXCVBNMENTER"].map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.split("").reduce<string[]>((acc, ch) => {
                // Handle multi-char tokens
                if (ch === "E" && row.startsWith("⌫") && ri === 2) {
                  // will handle below
                }
                acc.push(ch);
                return acc;
              }, []).map((_, i) => {
                // Parse the special row manually
                const keys = ri === 2
                  ? ["⌫", "Z","X","C","V","B","N","M", "ENTER"]
                  : row.split("");
                if (i >= keys.length) return null;
                const key = keys[i];
                const state = letterMap[key];
                const col = state ? TILE_COLORS[state] : null;
                const isWide = key === "ENTER" || key === "⌫";
                return (
                  <button key={key}
                          onClick={() => onKey(key)}
                          className="h-12 rounded-lg text-xs font-semibold transition-colors"
                          style={{
                            minWidth: isWide ? 52 : 30,
                            padding: "0 4px",
                            background: col ? col.bg : "var(--bg-raised)",
                            border: `1px solid ${col ? col.border : "var(--border)"}`,
                            color: col ? col.text : "var(--text-1)",
                          }}>
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
