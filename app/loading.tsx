export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-gray-800 rounded"></div>
          <div className="h-4 w-32 bg-gray-800 rounded"></div>
        </div>
        <div className="h-10 w-32 bg-gray-800 rounded"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-40 animate-pulse flex flex-col justify-between">
            <div className="h-6 w-3/4 bg-gray-700 rounded"></div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-700 rounded"></div>
              <div className="h-2 w-2/3 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}