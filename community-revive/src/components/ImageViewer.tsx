import React, { useState, useRef, useEffect, useCallback } from 'react';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerProps {
  images: Array<{
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
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

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

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
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
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
      dataSource: items,
      index: index,
      bgOpacity: 0.95,
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
      },
      onInit: () => {
        setIsFullscreen(true);
      }
    };

    pswpRef.current = new PhotoSwipe(options);
    pswpRef.current.init();
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
        <button
          onClick={() => openPhotoSwipe(currentIndex)}
          className="w-full h-64 md:h-80 lg:h-96 relative overflow-hidden rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`View image ${currentIndex + 1} in fullscreen`}
        >
          <img
            src={images[currentIndex]?.src}
            alt={images[currentIndex]?.alt || `Property image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01NjAgMzIwSDY0MFY0ODBINjAwVjM0MEg1NjBWMzIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNTIwIDM2MEg2ODBWNDQwSDUyMFYzNjBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjYwMCIgeT0iNTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiPkltYWdlIEVycm9yPC90ZXh0Pgo8L3N2Zz4=';
            }}
          />
          
          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </button>

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
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              onClick={() => goToImage(index)}
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
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA4MCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAyNEg0OFY0MEg0NFYzMkg0MFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iMzYgMjhINTRWMzZIMzZWMjhaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjQwIiB5PSI0OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5FcnJvcjwvdGV4dD4KPC9zdmc+';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
