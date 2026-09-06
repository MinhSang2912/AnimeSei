import { useState, useEffect } from 'react';

export const useDominantColor = (imageUrl?: string | null) => {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('/'))) {
      setColor(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let i = 0; i < imageData.length; i += 4) {
          // Bỏ qua pixel quá trong suốt
          if (imageData[i + 3] < 128) continue;
          
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
          count++;
        }

        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          
          // Làm sáng màu lên một chút để chữ nổi bật
          r = Math.min(255, r + 40);
          g = Math.min(255, g + 40);
          b = Math.min(255, b + 40);
          
          setColor(`rgb(${r}, ${g}, ${b})`);
        }
      } catch (e) {
        console.warn('Could not extract color due to CORS');
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return color;
};
