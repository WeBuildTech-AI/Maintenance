// reportWebVitals.ts
import { onCLS, onLCP, onTTFB, onINP, type Metric } from 'web-vitals/attribution';

/**
 * Report Core Web Vitals metrics (LCP, FID, CLS, INP, TTFB)
 * @param onPerfEntry - Callback function to handle each metric.
 * Example: (metric) => console.log(metric)
 */
const reportWebVitals = (onPerfEntry?: (metric: Metric) => void): void => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    onCLS(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
    onINP(onPerfEntry);
  }
};

export default reportWebVitals;
