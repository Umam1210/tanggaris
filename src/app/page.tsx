
export default function Home() {

const cells = [
    4, 5, 14, 15, "FINISH",
    3, 6, 13, 16, 23,
    2, 7, 12, 17, 22, 
    1, 8, 11, 18, 21,
    'START', 9, 10, 19, 20
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="relative w-[800px] h-[800px] mx-auto border-4 border-black">
     {/* Grid Overlay 5 baris x 2 kolom */}
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 z-10">
        {cells.map((cell, i) => (
          <div
            key={i}
            className="border border-white bg-transparent flex items-center justify-center text-black text-sm font-semibold"
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
