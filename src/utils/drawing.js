export const drawHandLandmarks = (ctx, landmarks, canvasWidth, canvasHeight, viewMode = 'skeleton', label = '') => {
  if (!landmarks || landmarks.length === 0) return;

  // Calculate bounding box regardless of mode, to position the label
  let minX = 1;
  let maxX = 0;
  let minY = 1;
  let maxY = 0;

  for (const point of landmarks) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }

  const pxMinX = minX * canvasWidth;
  const pxMaxX = maxX * canvasWidth;
  const pxMinY = minY * canvasHeight;
  const pxMaxY = maxY * canvasHeight;
  const padding = 20;

  if (viewMode === 'skeleton' || viewMode === 'both') {
    // Draw connections (skeleton)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [5, 9], [9, 10], [10, 11], [11, 12], // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
    ];
    
    ctx.beginPath();
    for (const connection of connections) {
      const start = landmarks[connection[0]];
      const end = landmarks[connection[1]];
      ctx.moveTo(start.x * canvasWidth, start.y * canvasHeight);
      ctx.lineTo(end.x * canvasWidth, end.y * canvasHeight);
    }
    ctx.stroke();

    // Draw joints (dots)
    ctx.fillStyle = "#38bdf8"; // Premium blue
    for (const point of landmarks) {
      ctx.beginPath();
      ctx.arc(point.x * canvasWidth, point.y * canvasHeight, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  if (viewMode === 'bounding_box' || viewMode === 'both') {
    const boxX = pxMinX - padding;
    const boxY = pxMinY - padding;
    const boxWidth = (pxMaxX - pxMinX) + (padding * 2);
    const boxHeight = (pxMaxY - pxMinY) + (padding * 2);

    ctx.strokeStyle = "rgba(56, 189, 248, 0.8)"; // Premium blue box
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    ctx.setLineDash([]); // Reset
  }

  if (viewMode === 'heatmap' || viewMode === 'both') {
    for (const point of landmarks) {
      const x = point.x * canvasWidth;
      const y = point.y * canvasHeight;
      
      // Draw a glowing effect using overlapping transparent circles.
      // We avoid createRadialGradient because it can fail or render invisibly 
      // in some browsers when the canvas context is mirrored (scale(-1, 1)).
      
      // Inner hot core
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.fill();
      
      // Middle warm layer
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.fill();
      
      // Outer glow layer
      ctx.beginPath();
      ctx.arc(x, y, 35, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(252, 211, 77, 0.1)';
      ctx.fill();
    }
  }

  // Draw Label (Handedness + Gesture)
  if (label) {
    ctx.save();
    // Context is currently mirrored to align with mirrored video.
    // Flip horizontally to draw readable text.
    ctx.scale(-1, 1);
    
    ctx.font = "600 14px 'Inter', sans-serif";
    const textWidth = ctx.measureText(label).width;
    const centerX = (pxMinX + pxMaxX) / 2;
    
    // Draw premium pill background
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.beginPath();
    ctx.roundRect(-centerX - textWidth/2 - 12, pxMinY - padding - 32, textWidth + 24, 28, 14);
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = "#e0f2fe"; // Light blue text
    ctx.fillText(label, -centerX - textWidth/2, pxMinY - padding - 13);
    
    ctx.restore();
  }
};

export const drawAirLines = (ctx, lines, canvasWidth, canvasHeight) => {
  if (!lines || lines.length === 0) return;
  
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#38bdf8"; // Primary blue
  
  // Add a neon glow effect
  ctx.shadowColor = "rgba(56, 189, 248, 0.8)";
  ctx.shadowBlur = 10;

  for (const line of lines) {
    if (line.length < 2) continue; // Need at least 2 points to draw a line
    
    ctx.beginPath();
    ctx.moveTo(line[0].x * canvasWidth, line[0].y * canvasHeight);
    for (let i = 1; i < line.length; i++) {
      ctx.lineTo(line[i].x * canvasWidth, line[i].y * canvasHeight);
    }
    ctx.stroke();
  }
  
  ctx.restore();
};
