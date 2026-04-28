"use client";
import React, { useEffect, useId, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export const Sparkles = ({
  className,
  size = 1,
  density = 800,
  speed = 1,
  color = "#FFFFFF",
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setIsReady(true);
    });
  }, []);

  const id = useId();

  const options = {
    fullScreen: { enable: false, zIndex: 1 },
    particles: {
      color: { value: color },
      move: { enable: true, speed: speed },
      number: { value: density },
      size: { value: size },
      opacity: {
        value: { min: 0.1, max: 1 },
        animation: { enable: true, speed: 3 },
      },
    },
    detectRetina: true,
  };

  return isReady && <Particles id={id} options={options} className={className} />;
};
