'use client';

import React, { useState } from 'react';

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
    <div className="sahib-gallery">
      {/* Main Large Image */}
      <div className="sahib-main-img-wrap">
        <img 
          id="sahib-main-img" 
          className="sahib-main-img" 
          src={images[index]} 
          alt={alt} 
        />
        <span className="sahib-img-counter" id="sahib-img-counter">
          {index + 1} / {images.length}
        </span>
        {images.length > 1 && (
          <>
            <button 
              className="sahib-arrow sahib-arrow-left" 
              id="sahib-prev"
              onClick={handlePrev}
            >
              ‹
            </button>
            <button 
              className="sahib-arrow sahib-arrow-right" 
              id="sahib-next"
              onClick={handleNext}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="sahib-thumbs" id="sahib-thumbs">
          {images.map((url, i) => (
            <img 
              key={url + i}
              className={`sahib-thumb ${i === index ? 'active' : ''}`} 
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
