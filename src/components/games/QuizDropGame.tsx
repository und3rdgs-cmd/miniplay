"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Props {
  onGameOver: (score: number) => void;
}

interface Question {
  q: string;
  options: string[];
  answer: number; // index
  category: string;
}

const QUESTIONS: Question[] = [
  { q: "What is the capital of Japan?",             options: ["Seoul","Beijing","Tokyo","Bangkok"],         answer: 2, category: "Geography" },
  { q: "How many sides does a hexagon have?",        options: ["5","6","7","8"],                             answer: 1, category: "Math" },
  { q: "Who painted the Mona Lisa?",                 options: ["Picasso","Da Vinci","Rembrandt","Monet"],    answer: 1, category: "Art" },
  { q: "What is the largest planet in our solar system?", options: ["Saturn","Neptune","Jupiter","Uranus"], answer: 2, category: "Science" },
  { q: "In what year did World War II end?",          options: ["1943","1944","1945","1946"],                answer: 2, category: "History" },
  { q: "What language has the most native speakers?", options: ["English","Spanish","Hindi","Mandarin"],    answer: 3, category: "Language" },
  { q: "How many bones are in the adult human body?", options: ["196","206","216","226"],                   answer: 1, category: "Science" },
  { q: "What is the chemical symbol for gold?",       options: ["Go","Gd","Au","Ag"],                       answer: 2, category: "Science" },
  { q: "Which country invented pizza?",               options: ["Greece","France","Italy","Spain"],         answer: 2, category: "Food" },
  { q: "What is the fastest land animal?",            options: ["Lion","Cheetah","Leopard","Gazelle"],      answer: 1, category: "Nature" },
  { q: "How many strings does a standard guitar have?", options: ["4","5","6","7"],                        answer: 2, category: "Music" },
  { q: "What is the square root of 144?",             options: ["11","12","13","14"],                       answer: 1, category: "Math" },
  { q: "Who wrote Romeo and Juliet?",                 options: ["Dickens","Chaucer","Shakespeare","Keats"], answer: 2, category: "Literature" },
  { q: "What is the smallest country in the world?",  options: ["Monaco","Liechtenstein","Vatican","Nauru"],answer: 2, category: "Geography" },
  { q: "How many hearts does an octopus have?",       options: ["1","2","3","4"],                           answer: 2, category: "Nature" },
  { q: "What year was the iPhone first released?",    options: ["2005","2006","2007","2008"],               answer: 2, category: "Tech" },
  { q: "Which planet is known as the Red Planet?",    options: ["Venus","Mars","Mercury","Pluto"],          answer: 1, category: "Science" },
  { q: "What is the currency of Brazil?",             options: ["Peso","Dollar","Real","Euro"],             answer: 2, category: "Geography" },
  { q: "How many players are in a basketball team?",  options: ["4","5","6","7"],                           answer: 1, category: "Sport" },
  { q: "What does 'HTTP' stand for?",                 options: ["HyperText Transfer Protocol","High Transfer Text Protocol","HyperText Transport Program","Home Transfer Text Protocol"], answer: 0, category: "Tech" },
  { q: "Which element has the atomic number 1?",      options: ["Helium","Oxygen","Carbon","Hydrogen"],     answer: 3, category: "Science" },
  { q: "Who was the first person to walk on the Moon?",options: ["Buzz Aldrin","Neil Armstrong","Yuri Gagarin","John Glenn"], answer: 1, category: "History" },
  { q: "What is the longest river in the world?",     options: ["Amazon","Congo","Yangtze","Nile"],         answer: 3, category: "Geography" },
  { q: "How many colors are in a rainbow?",           options: ["5","6","7","8"],                           answer: 2, category: "Science" },
  { q: "What is the hardest natural substance on Earth?", options: ["Gold","Iron","Diamond","Quartz"],     answer: 2, category: "Science" },
];

const QUESTION_TIME = 15; // seconds per question
const TOTAL_QUESTIONS = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type AnswerState = "unanswered" | "correct" | "wrong";

export default function QuizDropGame({ onGameOver }: Props) {
  const [questions]  = useState(() => shuffle(QUESTIONS).slice(0, TOTAL_QUESTIONS));
  const [qIndex, setQIndex]       = useState(0);
  const [score, setScore]         = useState(0);
  const [timeLeft, setTimeLeft]   = useState(QUESTION_TIME);
  const [selected, setSelected]   = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [streak, setStreak]       = useState(0);
  const [correct, setCorrect]     = useState(0);

  const scoreRef  = useRef(score);
  scoreRef.current = score;
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQ = questions[qIndex];
  const isLast   = qIndex >= TOTAL_QUESTIONS - 1;

  // Per-question timer
  useEffect(() => {
    if (answerState !== "unanswered") return;
    setTimeLeft(QUESTION_TIME);

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, answerState]);

  function handleTimeout() {
    setAnswerState("wrong");
    setStreak(0);
    scheduleNext();
  }

  function scheduleNext() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isLast) {
        onGameOver(scoreRef.current);
      } else {
        setQIndex((i) => i + 1);
        setSelected(null);
        setAnswerState("unanswered");
      }
    }, 1200);
  }

  const handleAnswer = useCallback((idx: number) => {
    if (answerState !== "unanswered") return;
    setSelected(idx);

    const isCorrect = idx === currentQ.answer;
    setAnswerState(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrect((c) => c + 1);
      const pts = Math.round((timeLeft / QUESTION_TIME) * 100) + (newStreak >= 3 ? 50 : 0);
      setScore((s) => s + pts);
    } else {
      setStreak(0);
    }

    scheduleNext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerState, currentQ, timeLeft, streak, isLast]);

  const timerPct   = (timeLeft / QUESTION_TIME) * 100;
  const timerColor = timeLeft <= 5 ? "#ff4444" : timeLeft <= 8 ? "#f5c842" : "var(--accent)";

  const optionStyle = (i: number) => {
    if (answerState === "unanswered") {
      return {
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        color: "var(--text-1)",
      };
    }
    if (i === currentQ.answer) {
      return { background: "rgba(200,241,53,0.15)", border: "1.5px solid rgba(200,241,53,0.7)", color: "#c8f135" };
    }
    if (i === selected && i !== currentQ.answer) {
      return { background: "rgba(255,60,60,0.12)", border: "1.5px solid rgba(255,60,60,0.5)", color: "#ff5555" };
    }
    return { background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-3)" };
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4">

      {/* HUD */}
      <div className="flex justify-between items-center px-1">
        <div>
          <span className="font-display text-2xl font-bold" style={{ color: "var(--accent)" }}>{score}</span>
          {streak >= 3 && (
            <span className="ml-2 text-xs font-semibold" style={{ color: "#f5c842" }}>🔥 ×{streak}</span>
          )}
        </div>
        <div className="text-sm" style={{ color: "var(--text-3)" }}>
          {qIndex + 1} / {TOTAL_QUESTIONS}
        </div>
        <div className="font-display text-xl font-bold" style={{ color: timerColor }}>{timeLeft}s</div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-raised)" }}>
        <div className="h-full rounded-full transition-all duration-1000"
             style={{ width: `${timerPct}%`, background: timerColor }} />
      </div>

      {/* Question card */}
      <div className="card p-5">
        <div className="text-xs font-semibold mb-2 uppercase tracking-wide"
             style={{ color: "var(--accent)", opacity: 0.7 }}>{currentQ.category}</div>
        <div className="font-display text-lg font-semibold leading-snug">{currentQ.q}</div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {currentQ.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={answerState !== "unanswered"}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              ...optionStyle(i),
              cursor: answerState !== "unanswered" ? "default" : "pointer",
            }}>
            <span className="mr-3 font-display font-bold" style={{ opacity: 0.5 }}>
              {["A","B","C","D"][i]}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {/* Answer feedback */}
      {answerState !== "unanswered" && (
        <div className="text-center text-sm font-semibold animate-fade-up"
             style={{ color: answerState === "correct" ? "var(--accent)" : "#ff5555" }}>
          {answerState === "correct"
            ? streak >= 3 ? `🔥 +${Math.round((timeLeft / QUESTION_TIME) * 100) + 50} pts (streak bonus!)` : `✓ +${Math.round((timeLeft / QUESTION_TIME) * 100)} pts`
            : `✗ The answer was: ${currentQ.options[currentQ.answer]}`}
        </div>
      )}

      <div className="text-center text-xs" style={{ color: "var(--text-3)" }}>
        {correct} correct · faster answers = more points
      </div>
    </div>
  );
}
