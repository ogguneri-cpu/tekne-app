'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface DetailGalleryProps {
  images: string[];
  alt: string;
}

export default function DetailGallery({ images, alt }: DetailGalleryProps) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <span className="text-text-muted">Görsel Yok</span>
      </div>
    );
  }

  const handlePrev = () => {
    setIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="sahib-gallery space-y-4">
      {/* Main Large Image */}
      <div className="sahib-main-img-wrap relative overflow-hidden rounded-xl bg-black aspect-video flex items-center justify-center">
        <img 
          id="sahib-main-img" 
          className="sahib-main-img max-h-full object-contain w-full h-full" 
          src={images[index]} 
          alt={alt} 
        />
        <span className="sahib-img-counter absolute bottom-4 right-4 bg-black/60 text-white px-2.5 py-1 rounded text-xs">
          {index + 1} / {images.length}
        </span>
        {images.length > 1 && (
          <>
            <button 
              className="sahib-arrow sahib-arrow-left absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors" 
              onClick={handlePrev}
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              className="sahib-arrow sahib-arrow-right absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors" 
              onClick={handleNext}
            >
              <ArrowRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="sahib-thumbs flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {images.map((url, i) => (
            <img 
              key={url + i}
              className={`sahib-thumb w-20 h-14 object-cover rounded cursor-pointer border-2 transition-all ${i === index ? 'active border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`} 
              src={url} 
              onClick={() => setIndex(i)} 
              alt={`Görsel ${i + 1}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
