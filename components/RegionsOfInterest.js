
import React, { useRef, useEffect } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import styles from './RegionsOfInterest.module.css'
const AreasOfInterest = ({ imageSrc, imageAlt, width, height, divClassName, className, areas, onAreaClick }) => {
  const [hoveredArea, setHoveredArea] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    const updateImageDimensions = () => {
      if (imageRef.current) {
        setImageDimensions({
          width: imageRef.current.width,
          height: imageRef.current.height
        });
      }
    };

    window.addEventListener('resize', updateImageDimensions);
    return () => window.removeEventListener('resize', updateImageDimensions);
  }, []);

  const handleImageLoad = (event) => {
    setImageDimensions({
      width: event.target.width,
      height: event.target.height
    });
  };

  const scaleArea = (area) => {
    const scaleX = imageDimensions.width / 100;
    const scaleY = imageDimensions.height / 100;
    return {
      left: area.x * scaleX,
      top: area.y * scaleY,
      width: area.width * scaleX,
      height: area.height * scaleY
    };
  };

  return (
    <>
      <div className={divClassName}>
        <Image src={imageSrc}
          alt={imageAlt}
          width={width}
          height={height}
          objectFit="contain"
          layout="responsive"
          className={className}
        />
        {areas.map((area, index) => (
          <div
            key={index}
            className={styles.area}
            style={{
              left: `${area.x}%`,
              top: `${area.y}%`,
              width: `${area.width}%`,
              height: `${area.height}%`
            }}
            onMouseEnter={() => setHoveredArea(index)}
            onMouseLeave={() => setHoveredArea(null)}
            onClick={() => onAreaClick(area.targetId)}
          >
            {hoveredArea === index && (
              <div className={styles.label}>
                {area.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default AreasOfInterest;
