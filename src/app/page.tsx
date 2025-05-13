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

  const questions: Record<string, { question: string; options: string[]; answer: string, isImage: boolean }> = {
    1: { question: "Gambar yang terdapat pada kotak nomor 1, termasuk kedalam hubungan antar garis...", options: ["Sejajar", "Bersilang"],  isImage: false, answer: "Bersilang" },
    2: { question: "Gambar yang terdapat pada kotak nomor 2, termasuk kedalam hubungan antar garis...", options: ["Bersilang", "Sejajar"],  isImage: false, answer: "Bersilang" },
    3: { question: "Gambar yang terdapat pada kotak nomor 3, termasuk kedalam hubungan antar garis...", options: ["Tegak Lurus", "Sejajar"],  isImage: false, answer: "Sejajar" },
    4: { question: "Gambar yang terdapat pada kotak nomor 4, termasuk kedalam hubungan antar garis...", options: ["Berhimpit", "Tegak Lurus"],  isImage: false, answer: "Berhimpit" },
    5: { question: "Gambar yang terdapat pada kotak nomor 5, termasuk kedalam hubungan antar garis...", options: ["Bersilang", "Berhimpit"],  isImage: false, answer: "Berhimpit" },
    6: { question: "Dibawah ini yang merupakan gambar garis sejajar adalah...", options: ["6.1", "6.2"],  isImage: true, answer: "6.1" },
    7: { question: "Gambar yang terdapat pada kotak nomor 7, termasuk kedalam hubungan antar garis...", options: ["Tegak Lurus", "Berhimpit"],  isImage: false, answer: "Tegak Lurus" },
    8: { question: "Gambar yang terdapat pada kotak nomor 8, termasuk kedalam hubungan antar garis...", options: ["Tegak Lurus", "Bersilang"],  isImage: false, answer: "Bersilang" },
    9: { question: "Gambar yang terdapat pada kotak nomor 9, termasuk kedalam hubungan antar garis...", options: ["Sejajar", "Bersilang"],  isImage: false, answer: "Sejajar" },
    10: { question: "Gambar yang terdapat pada kotak nomor 10, termasuk kedalam hubungan antar garis...", options: ["Berhimpit", "Sejajar"],  isImage: false, answer: "Sejajar" },
    11: { question: "Gambar yang terdapat pada kotak nomor 11, termasuk kedalam hubungan antar garis...", options: ["Berhimpit", "Sejajar"],  isImage: false, answer: "Berhimpit" },
    12: { question: "Dibawah ini yang merupakan gambar garis berhimpit adalah", options: ["12.1", "12.2"],  isImage: true, answer: "12.2" },
    13: { question: "Gambar yang terdapat pada kotak nomor 13, termasuk kedalam hubungan antar garis...", options: ["Bersilang", "berhimpit"],  isImage: false, answer: "Bersilang" },
    14: { question: "Gambar yang terdapat pada kotak nomor 14, termasuk kedalam hubungan antar garis...", options: ["Berhimpit", "Tegak Lurus"],  isImage: false, answer: "Tegak Lurus" },
    15: { question: "Gambar yang terdapat pada kotak nomor 15, termasuk kedalam hubungan antar garis...", options: ["Berhimpit", "Tegak Lurus"],  isImage: false, answer: "Tegak Lurus" },
    16: { question: "Gambar yang terdapat pada kotak nomor 16, termasuk kedalam hubungan antar garis...", options: ["Sejajar", "Berhimpit"],  isImage: false, answer: "Sejajar" },
    17: { question: "Gambar yang terdapat pada kotak nomor 17, termasuk kedalam hubungan antar garis...", options: ["Sejajar", "Berhimpit"],  isImage: false, answer: "Sejajar" },
    18: { question: "Dibawah ini yang merupakan gambar garis berhimpit adalah", options: ["18.1", "18.2"],  isImage: true, answer: "18.2" },
    19: { question: "Gambar yang terdapat pada kotak nomor 19, termasuk kedalam hubungan antar garis...", options: ["Berhimpit", "Tegak Lurus"],  isImage: false, answer: "Berhimpit" },
    20: { question: "Gambar yang terdapat pada kotak nomor 20, termasuk kedalam hubungan antar garis...", options: ["Berhimpit", "Tegak Lurus"],  isImage: false, answer: "Tegak Lurus" },
    21: { question: "Gambar yang terdapat pada kotak nomor 21, termasuk kedalam hubungan antar garis...", options: ["Bersilang", "Tegak Lurus"],  isImage: false, answer: "Bersilang" },
    22: { question: "Dibawah ini yang merupakan gambar garis bersilang adalah...", options: ["22.1", "22.2"],  isImage: true, answer: "22.1" },
    23: { question: "Gambar yang terdapat pada kotak nomor 23, termasuk kedalam hubungan antar garis...", options: ["Bersilang", "Tegak Lurus"],  isImage: false, answer: "Tegak Lurus" },

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

  const [help1, setHelp1] = useState<boolean>(false);
  const [help2, setHelp2] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState(false);
  const [modalQuestion, setModalQuestion] = useState<null | { cell: number; text: string; options: string[]; correct: string; isImage: boolean; jump?: number }>(null);
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
      setPositions(prev => { const arr = [...prev]; arr[currentPlayer] = newPos; return arr; });
      await delay(500);
    }
    const cellValue = cells[path[newPos]];
    if (newPos === path.length - 1) { setWinner(currentPlayer); return; }
    if (typeof cellValue === 'number' && questions[cellValue]) {
      const q = questions[cellValue];
      const jump = jumpMap[cellValue];
      setModalQuestion({ cell: cellValue, text: q.question, options: q.options, correct: q.answer, isImage: q.isImage, jump: jump === 'START' ? 0 : typeof jump === 'number' ? path.indexOf(cells.indexOf(jump)) : undefined });
    } else {
      setCurrentPlayer(prev => (prev + 1) % playerCount);
      setIsMoving(false);
    }
  };

  const answerQuestion = (selected: string) => {
    if (!modalQuestion) return;
    const jumpTarget = modalQuestion.jump;
    if (selected === modalQuestion.correct) setScores(prev => { const arr = [...prev]; arr[currentPlayer]++; return arr; });
    if (selected === modalQuestion.correct || jumpTarget === undefined) {
      setModalQuestion(null);
      setCurrentPlayer(prev => (prev + 1) % playerCount);
      setIsMoving(false);
      return;
    }
    setPositions(prev => { const arr = [...prev]; arr[currentPlayer] = jumpTarget!; return arr; });
    setModalQuestion(null);
    setTimeout(() => { setCurrentPlayer(prev => (prev + 1) % playerCount); setIsMoving(false); }, 300);
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

console.log("currentPlayer", currentPlayer);

  return (
    <>
      {modalQuestion && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded shadow-lg min-w-96">
            <p className="mb-4 font-bold text-lg text-center">{modalQuestion.text}</p>
            <div className="flex flex-col space-y-2">
              {modalQuestion.options.map((opt, i) => (
                <button key={i} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => answerQuestion(opt)}>
                  {modalQuestion.isImage && opt.includes('.') ? (
                    <Image src={`/${opt}.png`} alt={opt} width={50} height={50} />
                  ) : opt}
                </button>
              ))}
            </div>
            {currentPlayer === 1 && <>
              <button onClick={() => setHelp1(!help1)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                bantuan 1
              </button>
              {help1 && 
                <Image src={`/help.jpg`} alt='bantuan' width={700} height={740} className='mt-4' />
              }
            </>}
            {currentPlayer == 2 && <>
              <button onClick={() => setHelp1(!help1)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                bantuan 1
              </button>
              {help1 && 
                <Image src={`/help.jpg`} alt='bantuan' width={700} height={740} className='mt-4' />
              }
               <button onClick={() => setHelp2(!help2)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded ml-2">
                bantuan 2
              </button>
              {help2 && 
                <div className='mt-4 w-full h-full flex justify-center'>
                <iframe
                width="560"
                height="315"
                src="https://www.youtube-nocookie.com/embed/sIuaavYbQPg"
                title="YouTube video player"
                style={{ border: "0" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded shadow-lg"
                />              
                </div>
              }
            </>}
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
            src="/Black and White Abstract Geometric Business Rectangle Logo1.png"
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
