export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 border border-slate-100">
        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
          <span className="text-white font-black text-2xl">A</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AHABONA</h1>
          <p className="text-slate-600 font-medium">Garagaza ubushobozi bwawe, ubone abagukeneye.</p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            v6.0.0 Ready for Deployment
          </span>
        </div>
      </div>
    </div>
  );
      }
