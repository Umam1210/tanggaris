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

  // Build path: START -> 1..23 -> FINISH
  const path: number[] = [startIndex];
  for (let num = 1; num <= 23; num++) {
    const idx = cells.indexOf(num);
    if (idx !== -1) path.push(idx);
  }
  path.push(finishIndex);

  // Snakes and ladders mapping
  const jumpMap: Record<number, number | 'START'> = {
    6: 2,
    12: 'START',
    18: 13,
    22: 15,
    13: 15,
    19: 21
  };

  // Questions for modal popup
  const questions: Record<number, string> = {
    1: 'test test test',
    2: 'test test test',
    3: 'test test test',
    4: 'test test test',
    5: 'test test test',
    6: 'test test test',
    7: 'test test test',
    8: 'test test test',
    9: 'test test test',
    10: 'test test test'
  };

  const playerCount = 3;
  // Load initial state from localStorage or default
  const getStored = <T,>(key: string, fallback: T) => {
    if (typeof window === 'undefined') return fallback;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  };

  const [positions, setPositions] = useState<number[]>(() =>
    getStored('positions', Array(playerCount).fill(0))
  );
  const [currentPlayer, setCurrentPlayer] = useState<number>(() =>
    getStored('currentPlayer', 0)
  );
  const [isMoving, setIsMoving] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);

  const boardSize = 790;
  const cellSize = boardSize / 5;
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('positions', JSON.stringify(positions));
  }, [positions]);
  useEffect(() => {
    localStorage.setItem('currentPlayer', JSON.stringify(currentPlayer));
  }, [currentPlayer]);

  const rollDice = async () => {
    if (isMoving) return;
    setIsMoving(true);
    const dice = Math.floor(Math.random() * 6) + 1;
    let newPos = positions[currentPlayer];

    // Animate step by step
    for (let step = 1; step <= dice; step++) {
      newPos = Math.min(newPos + 1, path.length - 1);
      setPositions(prev => {
        const arr = [...prev]; arr[currentPlayer] = newPos; return arr;
      });
      await delay(500);
    }

    // Check snake or ladder
    let landedIdx = path[newPos];
    let cellValue = cells[landedIdx];
    if (typeof cellValue === 'number' && jumpMap[cellValue] !== undefined) {
      const target = jumpMap[cellValue];
      if (target === 'START') {
        newPos = 0;
      } else {
        const tgtIdx = cells.indexOf(target as number);
        newPos = path.indexOf(tgtIdx);
      }
      setPositions(prev => {
        const arr = [...prev]; arr[currentPlayer] = newPos; return arr;
      });
      await delay(500);
      landedIdx = path[newPos];
      cellValue = cells[landedIdx];
    }

    // Show question modal if defined
    if (typeof cellValue === 'number' && questions[cellValue]) {
      setModalContent(questions[cellValue]);
    } else {
      setCurrentPlayer(prev => (prev + 1) % playerCount);
      setIsMoving(false);
    }
  };

  const closeModal = () => {
    setModalContent(null);
    setCurrentPlayer(prev => (prev + 1) % playerCount);
    setIsMoving(false);
  };

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <>
      {modalContent && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded shadow-lg w-80 h-80">
            <p className="mb-4 text-center">{modalContent}</p>
            <button
              className="block mx-auto px-4 py-2 bg-blue-600 text-white rounded"
              onClick={closeModal}
            >Tutup</button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="relative w-[800px] h-[820px] mx-auto">
          {/* Background board image */}
          <Image
            src="/Black and White Abstract Geometric Business Rectangle Logo.png"
            alt="Snake Ladder Board"
            layout="fill"
            objectFit="cover"
            className='my-4'
          />

          {/* Tokens */}
          {positions.map((posIdx, pIdx) => {
            const gridIdx = path[posIdx];
            const row = Math.floor(gridIdx / 5);
            const col = gridIdx % 5;
            return (
              <motion.div
                key={pIdx}
                className={`${colors[pIdx]} absolute mt-28 ml-16 w-8 h-8 rounded-full z-20`}
                animate={{ top: row * cellSize + 4, left: col * cellSize + 4 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </div>
        <div className="mb-4 pt-20 text-lg font-semibold">
          Giliran Pemain: {currentPlayer + 1}
        </div>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={rollDice} disabled={isMoving}
        >Roll Dice</button>
      </div>
    </>
  );
}
