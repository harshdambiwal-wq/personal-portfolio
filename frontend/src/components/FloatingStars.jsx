import React, { useMemo } from 'react';

export default function FloatingStars() {
  const starsCount = 18; // 15-20 tiny white star dots

  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < starsCount; i++) {
      arr.push({
        left: `${Math.random() * 100}%`,
        delay: `-${Math.random() * 20}s`,
        duration: `${15 + Math.random() * 8}s` // 15-23s slow rise animation
      });
    }
    return arr;
  }, []);

  return (
    <div className="star-particles-container">
      {stars.map((star, i) => (
        <div
          key={i}
          className="floating-star"
          style={{
            position: 'absolute',
            left: star.left,
            bottom: '-10px',
            width: '1px',
            height: '1px',
            backgroundColor: '#ffffff',
            opacity: 0.15,
            animationName: 'floatStarUp',
            animationDuration: star.duration,
            animationDelay: star.delay,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear'
          }}
        />
      ))}
    </div>
  );
}
