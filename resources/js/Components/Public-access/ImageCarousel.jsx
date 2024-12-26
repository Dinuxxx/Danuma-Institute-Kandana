import React, { useState, useEffect } from 'react';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Auto slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const goToNext = () => {
    if (currentIndex === images.length - 1) {
      setIsTransitioning(false);
      setTimeout(() => {
        setCurrentIndex(0);
      }, 700);
    } else {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setTimeout(() => {
        setCurrentIndex(images.length - 1);
      }, 700);
    } else {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  useEffect(() => {
    if (currentIndex === 0 || currentIndex === images.length - 1) {
      setTimeout(() => {
        setIsTransitioning(true);
      }, 0);
    }
  }, [currentIndex]);

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden">
      {/* Carousel Images */}
      <div
        className={`flex ${isTransitioning ? 'transition-transform duration-700' : ''}`}
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className="w-full flex-shrink-0 h-[300px] sm:h-[380px] md:h-[420px]"
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrev}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
      >
        &#10094;
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
      >
        &#10095;
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? 'bg-blue-500' : 'bg-gray-300'
            } cursor-pointer`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
