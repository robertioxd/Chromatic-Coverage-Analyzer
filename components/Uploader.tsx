import React, { useCallback, useEffect, useState } from 'react';

interface UploaderProps {
  onImageSelected: (file: File) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          onImageSelected(file);
          e.preventDefault();
        }
      }
    }
  }, [onImageSelected]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-300 ease-in-out
        border-2 border-dashed rounded-2xl p-12 text-center
        flex flex-col items-center justify-center min-h-[300px]
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input 
        id="fileInput"
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleInputChange}
      />
      
      <div className={`
        w-20 h-20 mb-6 rounded-full bg-indigo-100 flex items-center justify-center
        transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}
      `}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        Click, Drop, or Paste (Ctrl+V)
      </h3>
      <p className="text-slate-500 max-w-sm mx-auto">
        Upload an image to break down its color composition and analyze coverage percentages.
      </p>
      
      <div className="mt-8 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-400 shadow-sm">
        Supports JPG, PNG, WEBP
      </div>
    </div>
  );
};

export default Uploader;