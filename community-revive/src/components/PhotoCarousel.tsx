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

    const options = {
      dataSource: images.map((image) => ({
        src: image.src,
        width: image.width || 1440,
        height: image.height || 960,
        alt: image.alt || 'Property image'
      })),
      index: index,
      bgOpacity: 0.95,
      showHideOpacity: true,
      closeOnVerticalDrag: true,
      closeOnScroll: false,
      closeTitle: 'Close (Esc)',
      zoomTitle: 'Zoom in/out',
      arrowPrevTitle: 'Previous (arrow left)',
      arrowNextTitle: 'Next (arrow right)',
      errorMsg: 'The image could not be loaded.',
      returnFocus: false,
      trapFocus: true,
      zoom: true,
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
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <button
            type="button"
            onClick={() => openPhotoSwipe(currentIndex)}
            className="w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Click to view full size"
            aria-label={`View ${images[currentIndex]?.alt || 'property image'} in fullscreen`}
          >
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
            <img
              src={images[currentIndex]?.src}
              alt={images[currentIndex]?.alt || `Property image ${currentIndex + 1}`}
              className="w-full h-64 md:h-80 lg:h-96 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Overlay with zoom icon and text */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center pointer-events-none">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                <div className="bg-white bg-opacity-90 rounded-full p-4 shadow-lg">
                  <ZoomIn className="w-8 h-8 text-gray-800" />
                </div>
                <span className="text-white font-semibold text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
                  Click to view full size
                </span>
              </div>
            </div>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
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
              // eslint-disable-next-line react/no-array-index-key
              key={`thumb-${image.src.substring(image.src.length - 20)}-${index}`}
              onClick={() => setCurrentIndex(index)}
              onDoubleClick={() => openPhotoSwipe(index)}
              className={`group/thumb relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              title={index === currentIndex ? "Current image - Double click to view full size" : "Click to preview - Double click to view full size"}
            >
              <img
                src={image.src}
                alt={image.alt || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-110"
              />
              {/* Mini zoom icon on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/thumb:bg-opacity-40 transition-all duration-200 flex items-center justify-center pointer-events-none">
                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((image, index) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={`dot-${image.src.substring(image.src.length - 20)}-${index}`}
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
