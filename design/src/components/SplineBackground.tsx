import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion, useMotionValueEvent } from 'motion/react';

const Spline = React.lazy(() => import('@splinetool/react-spline'));

export default function SplineBackground() {
  const { scrollYProgress } = useScroll();
  const [splineApp, setSplineApp] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const x = useTransform(scrollYProgress, [0, 0.5, 1], ["28%", "-30%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.05, 1.1]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (splineApp) {
      // Rotate the main object. We iterate to find an object that has rotation.
      // Usually, the main mesh or group is what we want to rotate.
      // If we don't know the exact name, we can rotate the first non-camera/light object.
      const objects = splineApp.getObjects();
      const mainObj = objects.find((o: any) => o.name !== 'Directional Light' && o.name !== 'Camera');
      if (mainObj && mainObj.rotation) {
        mainObj.rotation.y = latest * Math.PI * 2;
      }
    }
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e: WheelEvent) => {
      // Forward wheel event to window so scrolling works over the 3D canvas
      window.scrollBy({
        top: e.deltaY,
        left: e.deltaX,
        behavior: 'auto'
      });
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <motion.div 
      ref={wrapperRef}
      className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center"
      style={{ x, scale }}
    >
      <Suspense fallback={<div className="w-full h-full bg-black" />}>
        <Spline 
          scene="https://prod.spline.design/PIgTjpRFA03yfLyK/scene.splinecode" 
          onLoad={(spline) => setSplineApp(spline)}
        />
      </Suspense>
    </motion.div>
  );
}
