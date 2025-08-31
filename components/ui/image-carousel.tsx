"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  imageClassName?: string;
}

export default function ImageCarousel({
  images,
  autoSlide = true,
  autoSlideInterval = 4000,
  showDots = true,
  showArrows = true,
  className = "",
  imageClassName = "rounded-2xl shadow-2xl w-full object-cover",
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide functionality
  useEffect(() => {
    if (!autoSlide || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, autoSlideInterval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Main image container */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width || 600}
                height={image.height || 600}
                className={imageClassName}
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {showArrows && images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border-sage/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4 text-sage" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border-sage/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4 text-sage" />
            </Button>
          </>
        )}
      </div>

      {/* Dots indicator */}
      {showDots && images.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-golden w-6"
                  : "bg-sage/30 hover:bg-sage/50"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
