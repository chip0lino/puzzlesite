'use client';

import React, { useEffect, useRef } from 'react';
import { SkinViewer } from 'skinview3d';

export default function MinecraftSkinViewer({ username }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Очистка
    containerRef.current.innerHTML = '';

    const viewer = new SkinViewer({
      width: 320,
      height: 480,
      skin: `https://mc-heads.net/skin/${username}`,
    });

    // Позиция камеры
    viewer.camera.position.y = 10;

    // Вращение
    viewer.autoRotate = true;
    viewer.autoRotateSpeed = 1;

    // Добавляем в DOM
    containerRef.current.appendChild(viewer.canvas);

    viewerRef.current = viewer;

    return () => {
      viewer.dispose();
    };
  }, [username]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '320px',
        height: '480px',
        background: '#ccc',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
}
