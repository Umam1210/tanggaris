"use client";

import Image from 'next/image';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const cells = [
    4, 5, 14, 15, "FINISH",
    3, 6, 13, 16, 23,
    2, 7, 12, 17, 22,
    1, 8, 11, 18, 21,
    'START', 9, 10, 19, 20
  ];

  const startIndex = cells.indexOf('START');
  const finishIndex = cells.indexOf('FINISH');

  const path: number[] = [startIndex];
  for (let num = 1; num <= 23; num++) {
    const idx = cells.indexOf(num);
    if (idx !== -1) path.push(idx);
  }
  path.push(finishIndex);

  const jumpMap: Record<number, number | 'START'> = {
    6: 2,
    12: 'START',
    18: 13,
    22: 15,
    13: 15,
    19: 21
  };

  const questions: Record<number, { question: string; options: string[]; answer: string }> = {
    1: { question: "2 + 3 = ?", options: ["5", "4"], answer: "5" },
    2: { question: "5 - 2 = ?", options: ["2", "3"], answer: "3" },
    3: { question: "1 + 1 = ?", options: ["3", "2"], answer: "2" },
    4: { question: "7 - 4 = ?", options: ["3", "2"], answer: "3" },
    5: { question: "10 - 6 = ?", options: ["4", "5"], answer: "4" },
    6: { question: "3 + 3 = ?", options: ["6", "5"], answer: "6" },
    7: { question: "8 - 3 = ?", options: ["5", "6"], answer: "5" },
    8: { question: "2 + 4 = ?", options: ["6", "7"], answer: "6" },
    9: { question: "9 - 1 = ?", options: ["7", "8"], answer: "8" },
    10: { question: "6 + 1 = ?", options: ["7", "6"], answer: "7" }
  };

  const playerCount = 3;
  const getStored = <T,>(key: string, fallback: T) => {
    if (typeof window === 'undefined') return fallback;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  };

  const [positions, setPositions] = useState<number[]>(() =>
    getStored('positions', Array(playerCount).fill(0))
  );
  const [scores, setScores] = useState<number[]>(() =>
    getStored('scores', Array(playerCount).fill(0))
  );
  const [currentPlayer, setCurrentPlayer] = useState<number>(() =>
    getStored('currentPlayer', 0)
  );
  const [isMoving, setIsMoving] = useState(false);
  const [modalQuestion, setModalQuestion] = useState<null | { text: string; options: string[]; correct: string; jump?: number }>(null);
  const [winner, setWinner] = useState<number | null>(null);

  const boardSize = 790;
  const cellSize = boardSize / 5;
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    localStorage.setItem('positions', JSON.stringify(positions));
    localStorage.setItem('scores', JSON.stringify(scores));
  }, [positions, scores]);
  useEffect(() => {
    localStorage.setItem('currentPlayer', JSON.stringify(currentPlayer));
  }, [currentPlayer]);

  const rollDice = async () => {
    if (isMoving || winner !== null) return;
    setIsMoving(true);
    const dice = Math.floor(Math.random() * 6) + 1;
    let newPos = positions[currentPlayer];

    for (let step = 1; step <= dice; step++) {
      newPos = Math.min(newPos + 1, path.length - 1);
      setPositions(prev => {
        const arr = [...prev]; arr[currentPlayer] = newPos; return arr;
      });
      await delay(500);
    }

    const landedIdx = path[newPos];
    const cellValue = cells[landedIdx];

    if (newPos === path.length - 1) {
      setWinner(currentPlayer);
      return;
    }

    if (typeof cellValue === 'number' && questions[cellValue]) {
      const { question, options, answer } = questions[cellValue];
      const jump = jumpMap[cellValue];
      setModalQuestion({ text: question, options, correct: answer, jump: jump === 'START' ? 0 : typeof jump === 'number' ? path.indexOf(cells.indexOf(jump)) : undefined });
    } else {
      setCurrentPlayer(prev => (prev + 1) % playerCount);
      setIsMoving(false);
    }
  };

  const answerQuestion = (selected: string) => {
    if (!modalQuestion) return;
    const jumpTarget = modalQuestion.jump;
    if (selected === modalQuestion.correct) {
      setScores(prev => {
        const newScores = [...prev];
        newScores[currentPlayer] += 1;
        return newScores;
      });
    }
    if (selected === modalQuestion.correct || jumpTarget === undefined) {
      setModalQuestion(null);
      setCurrentPlayer(prev => (prev + 1) % playerCount);
      setIsMoving(false);
      return;
    }
    setPositions(prev => {
      const arr = [...prev];
      arr[currentPlayer] = jumpTarget;
      return arr;
    });
    setModalQuestion(null);
    setTimeout(() => {
      setCurrentPlayer(prev => (prev + 1) % playerCount);
      setIsMoving(false);
    }, 300);
  };

  const resetGame = () => {
    setPositions(Array(playerCount).fill(0));
    setScores(Array(playerCount).fill(0));
    setCurrentPlayer(0);
    setWinner(null);
    setModalQuestion(null);
    setIsMoving(false);
    localStorage.clear();
  };

  return (
    <>
      {modalQuestion && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <p className="mb-4 font-bold text-lg text-center">{modalQuestion.text}</p>
            <div className="flex flex-col space-y-2">
              {modalQuestion.options.map((opt, i) => (
                <button key={i} className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => answerQuestion(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {winner !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
            <h2 className="text-xl font-bold mb-4">Pemain {winner + 1} Menang!</h2>
            <h3 className="mb-2 font-semibold">Skor Akhir:</h3>
            {scores.map((score, idx) => (
              <p key={idx}>Pemain {idx + 1}: {score} poin</p>
            ))}
            <button onClick={resetGame} className="mt-4 px-4 py-2 bg-green-600 text-white rounded">Main Lagi</button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="relative w-[800px] h-[820px] mx-auto">
          <Image
            src="/Black and White Abstract Geometric Business Rectangle Logo.png"
            alt="Snake Ladder Board"
            layout="fill"
            objectFit="cover"
            className='mt-8'
          />

          {positions.map((posIdx, pIdx) => {
            const gridIdx = path[posIdx];
            const row = Math.floor(gridIdx / 5);
            const col = gridIdx % 5;
            const offset = 30 * pIdx;
            return (
              <motion.div
                key={pIdx}
                className="absolute mt-16 ml-2 z-20"
                animate={{ top: row * cellSize + 4 + offset, left: col * cellSize + 4 + offset }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={`/pawn-${pIdx + 1}.png`}
                  alt={`Player ${pIdx + 1}`}
                  width={70}
                  height={70}
                />
              </motion.div>
            );
          })}
        </div>
        <div className="mb-4 pt-20 text-lg font-semibold">
          Giliran Pemain: {currentPlayer + 1}
        </div>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={rollDice} disabled={isMoving || winner !== null}
        >Roll Dice</button>
      </div>
    </>
  );
}
