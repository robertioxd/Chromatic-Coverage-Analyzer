import { RGB, ColorCluster } from '../types';

// Convert RGB to Hex string
export const rgbToHex = ({ r, g, b }: RGB): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Calculate Euclidean distance squared (faster than sqrt)
const distanceSq = (c1: RGB, c2: RGB): number => {
  return Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2);
};

// K-Means Clustering Algorithm
export const performKMeans = (
  imageData: Uint8ClampedArray, 
  k: number = 6, 
  maxIterations: number = 20
): ColorCluster[] => {
  const pixels: RGB[] = [];
  
  // 1. Extract valid pixels (ignoring transparency)
  // We sample pixels to improve performance if image is huge, 
  // but for accurate coverage of the sampled set, we try to use most.
  // Stride helps performance on 4k images.
  const stride = 4 * 4; // Skip every 4th pixel for speed optimization without losing much accuracy
  
  for (let i = 0; i < imageData.length; i += stride) {
    const a = imageData[i + 3];
    if (a > 10) { // Ignore fully/mostly transparent pixels
      pixels.push({
        r: imageData[i],
        g: imageData[i + 1],
        b: imageData[i + 2]
      });
    }
  }

  if (pixels.length === 0) return [];

  // 2. Initialize Centroids (Randomly pick k pixels)
  let centroids: RGB[] = [];
  for (let i = 0; i < k; i++) {
    centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
  }

  // 3. Iterate
  const assignments = new Int8Array(pixels.length);
  let iterations = 0;
  let changed = true;

  while (changed && iterations < maxIterations) {
    changed = false;
    const newCentroidSums = Array(k).fill(0).map(() => ({ r: 0, g: 0, b: 0, count: 0 }));

    // Assign pixels to nearest centroid
    for (let i = 0; i < pixels.length; i++) {
      let minDist = Infinity;
      let clusterIndex = 0;
      
      for (let j = 0; j < k; j++) {
        const d = distanceSq(pixels[i], centroids[j]);
        if (d < minDist) {
          minDist = d;
          clusterIndex = j;
        }
      }

      if (assignments[i] !== clusterIndex) {
        assignments[i] = clusterIndex;
        changed = true;
      }

      newCentroidSums[clusterIndex].r += pixels[i].r;
      newCentroidSums[clusterIndex].g += pixels[i].g;
      newCentroidSums[clusterIndex].b += pixels[i].b;
      newCentroidSums[clusterIndex].count++;
    }

    // Recalculate Centroids
    for (let j = 0; j < k; j++) {
      if (newCentroidSums[j].count > 0) {
        centroids[j] = {
          r: newCentroidSums[j].r / newCentroidSums[j].count,
          g: newCentroidSums[j].g / newCentroidSums[j].count,
          b: newCentroidSums[j].b / newCentroidSums[j].count,
        };
      } else {
        // Re-initialize empty cluster to a random pixel
        centroids[j] = pixels[Math.floor(Math.random() * pixels.length)];
      }
    }
    iterations++;
  }

  // 4. Calculate Final Stats
  const clusters: ColorCluster[] = centroids.map((c, index) => {
    // Count actual assignments
    let count = 0;
    for(let i=0; i<assignments.length; i++) {
      if(assignments[i] === index) count++;
    }
    return {
      color: c,
      hex: rgbToHex(c),
      count: count,
      percentage: (count / pixels.length) * 100
    };
  });

  // Sort by percentage descending and filter out tiny clusters (< 1%)
  return clusters
    .sort((a, b) => b.percentage - a.percentage)
    .filter(c => c.percentage > 0.5); 
};