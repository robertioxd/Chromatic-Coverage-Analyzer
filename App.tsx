import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, AnalysisState, ColorCluster } from './types';
import { performKMeans } from './utils/colorUtils';
import Uploader from './components/Uploader';
import ColorChart from './components/ColorChart';
import PaletteList from './components/PaletteList';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [kValue, setKValue] = useState<number>(8);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const processImage = async (file: File) => {
    setState(AnalysisState.LOADING_IMAGE);
    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);

    const img = new Image();
    img.src = objectUrl;
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      setState(AnalysisState.PROCESSING);
      
      // Use setTimeout to allow UI to update to "Processing" state before blocking thread
      setTimeout(() => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Resize logic for performance: Limit dimension to 600px max for analysis
          const MAX_SIZE = 600;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const imageData = ctx.getImageData(0, 0, width, height);
          const startTime = performance.now();
          
          // Use the user-selected kValue
          const clusters = performKMeans(imageData.data, kValue);
          
          const endTime = performance.now();

          setResult({
            clusters,
            totalPixels: width * height,
            processingTime: endTime - startTime
          });
          
          setState(AnalysisState.COMPLETE);
        } catch (error) {
          console.error("Analysis failed:", error);
          setState(AnalysisState.ERROR);
        }
      }, 100);
    };

    img.onerror = () => {
      setState(AnalysisState.ERROR);
    };
  };

  const handleReset = () => {
    setImageSrc(null);
    setResult(null);
    setState(AnalysisState.IDLE);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              %
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">ColorCover</h1>
          </div>
          {state === AnalysisState.COMPLETE && (
            <button 
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Analyze New Image
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {state === AnalysisState.IDLE && (
          <div className="max-w-2xl mx-auto mt-12 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Clustering Configuration</h2>
                  <p className="text-sm text-slate-500">Determine how many dominant colors to identify.</p>
                </div>
                <div className="text-3xl font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
                  {kValue}
                </div>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="range" 
                  min="2" 
                  max="16" 
                  step="1" 
                  value={kValue}
                  onChange={(e) => setKValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs font-medium text-slate-400 px-1">
                  <span>2 Colors (Simplified)</span>
                  <span>16 Colors (Detailed)</span>
                </div>
              </div>
            </div>

            <Uploader onImageSelected={processImage} />
          </div>
        )}

        {state === AnalysisState.LOADING_IMAGE || state === AnalysisState.PROCESSING ? (
           <div className="max-w-2xl mx-auto mt-32 text-center">
             <div className="inline-block w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
             <h2 className="text-2xl font-semibold text-slate-800">
               {state === AnalysisState.LOADING_IMAGE ? 'Loading Image...' : 'Analyzing Colors...'}
             </h2>
             <p className="text-slate-500 mt-2">Running K-Means clustering algorithm with K={kValue}.</p>
           </div>
        ) : null}

        {state === AnalysisState.COMPLETE && result && imageSrc && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Row: Image & Key Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Image Preview */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Original Source</h3>
                  <div className="relative rounded-xl overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-100 border border-slate-200 aspect-video flex items-center justify-center">
                    <img 
                      src={imageSrc} 
                      alt="Analyzed" 
                      className="max-h-full max-w-full object-contain shadow-md" 
                    />
                  </div>
                </div>

                <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg bg-gradient-to-br from-indigo-600 to-indigo-800">
                  <div className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Dominant Color</div>
                  <div className="text-3xl font-bold mb-4">{result.clusters[0]?.hex}</div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-white" 
                      style={{ width: `${result.clusters[0]?.percentage}%` }} 
                    />
                  </div>
                  <div className="text-indigo-100 text-sm">
                    Covers {result.clusters[0]?.percentage.toFixed(1)}% of the image area
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="lg:col-span-7">
                 <ColorChart clusters={result.clusters} />
              </div>
            </div>

            {/* Bottom Row: Detailed List */}
            <div className="grid grid-cols-1">
              <PaletteList clusters={result.clusters} />
            </div>

            <div className="text-center text-xs text-slate-400 pt-8">
              Processed in {Math.round(result.processingTime)}ms using K-Means Clustering (k={kValue}).
            </div>
          </div>
        )}

        {state === AnalysisState.ERROR && (
           <div className="max-w-md mx-auto mt-32 text-center p-8 bg-red-50 rounded-2xl border border-red-100">
             <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
             </div>
             <h3 className="text-lg font-bold text-red-800 mb-2">Analysis Failed</h3>
             <p className="text-red-600 mb-6">Something went wrong while processing the image. Please try another file.</p>
             <button 
               onClick={handleReset}
               className="px-6 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
             >
               Try Again
             </button>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;