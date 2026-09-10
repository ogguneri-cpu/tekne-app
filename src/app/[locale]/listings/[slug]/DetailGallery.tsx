'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DetailGalleryProps {
  images: string[];
  alt: string;
}

export default function DetailGallery({ images, alt }: DetailGalleryProps) {
  const [index, setIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <span className="text-text-muted">Görsel Yok</span>
      </div>
    );
  }

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      // Swiped left -> next
      handleNext();
    } else if (distance < -45) {
      // Swiped right -> prev
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen, images.length]);

  return (
    <>
      <div className="sahib-gallery">
        {/* Main Large Image */}
        <div 
          className="sahib-main-img-wrap"
          style={{ background: '#f8fafc', cursor: 'zoom-in' }}
          onClick={() => setIsModalOpen(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
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
                type="button"
                className="sahib-arrow sahib-arrow-left" 
                id="sahib-prev"
                onClick={handlePrev}
                aria-label="Önceki"
              >
                ‹
              </button>
              <button 
                type="button"
                className="sahib-arrow sahib-arrow-right" 
                id="sahib-next"
                onClick={handleNext}
                aria-label="Sonraki"
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

      {/* Fullscreen Lightbox Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.94)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            userSelect: 'none',
            backdropFilter: 'blur(6px)'
          }}
        >
          {/* Top Bar: Counter & Close Button */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#ffffff',
              padding: '6px 4px',
              zIndex: 10
            }}
          >
            <span style={{ 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              background: 'rgba(255, 255, 255, 0.15)', 
              padding: '4px 14px', 
              borderRadius: '20px',
              letterSpacing: '0.5px'
            }}>
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Kapat"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              ✕
            </button>
          </div>

          {/* Center Image with Left/Right Buttons */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Önceki görsel"
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.25)',
                  border: 'none',
                  color: '#ffffff',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  fontSize: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 5,
                  backdropFilter: 'blur(4px)',
                  lineHeight: '1'
                }}
              >
                ‹
              </button>
            )}

            <img
              src={images[index]}
              alt={`${alt} (${index + 1})`}
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: '96vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                transition: 'opacity 0.2s ease'
              }}
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Sonraki görsel"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.25)',
                  border: 'none',
                  color: '#ffffff',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  fontSize: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 5,
                  backdropFilter: 'blur(4px)',
                  lineHeight: '1'
                }}
              >
                ›
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {images.length > 1 && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '8px 4px 4px',
                justifyContent: images.length <= 6 ? 'center' : 'flex-start',
                zIndex: 10
              }}
            >
              {images.map((url, i) => (
                <img
                  key={url + i}
                  src={url}
                  alt={`Küçük görsel ${i + 1}`}
                  onClick={() => setIndex(i)}
                  style={{
                    width: '54px',
                    height: '40px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    opacity: i === index ? 1 : 0.45,
                    border: i === index ? '2px solid #0066ff' : '1px solid rgba(255,255,255,0.2)',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
