import React, { useState, useRef, useEffect, useCallback } from 'react';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface PhotoCarouselProps {
  images: Array<{
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
}

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ 
  images, 
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pswpRef = useRef<PhotoSwipe | null>(null);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === 'Escape') {
          closePhotoSwipe();
        } else if (e.key === 'ArrowLeft') {
          goToPrevious();
        } else if (e.key === 'ArrowRight') {
          goToNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, goToPrevious, goToNext]);

  const openPhotoSwipe = (index: number) => {
    if (images.length === 0) return;

    const items = images.map((image) => ({
      src: image.src,
      width: image.width || 1200,
      height: image.height || 800,
      alt: image.alt || 'Property image'
    }));

    const options = {
      index: index,
      bgOpacity: 0.8,
      showHideOpacity: true,
      closeOnVerticalDrag: true,
      closeOnScroll: true,
      closeTitle: 'Close (Esc)',
      zoomTitle: 'Zoom in/out',
      arrowPrevTitle: 'Previous (arrow left)',
      arrowNextTitle: 'Next (arrow right)',
      errorMsg: 'The image could not be loaded.',
      returnFocus: false,
      trapFocus: false,
      onClose: () => {
        setIsFullscreen(false);
        pswpRef.current = null;
      }
    };

    pswpRef.current = new PhotoSwipe(options);
    pswpRef.current.init();
    setIsFullscreen(true);
  };

  const closePhotoSwipe = () => {
    if (pswpRef.current) {
      pswpRef.current.close();
    }
  };

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
            📷
          </div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Image Display */}
      <div className="relative group">
        <div className="relative overflow-hidden rounded-lg bg-gray-100">
          <img
            src={images[currentIndex]?.src}
            alt={images[currentIndex]?.alt || `Property image ${currentIndex + 1}`}
            className="w-full h-64 md:h-80 lg:h-96 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => openPhotoSwipe(currentIndex)}
          />
          
          {/* Overlay with zoom icon */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg">
                <ZoomIn className="w-6 h-6 text-gray-800" />
              </div>
            </div>
          </div>

          {/* Image counter */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image.src}
                alt={image.alt || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-blue-500 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
