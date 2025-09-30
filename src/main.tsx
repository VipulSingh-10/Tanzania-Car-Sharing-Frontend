import { createRoot } from 'react-dom/client'
import 'maplibre-gl/dist/maplibre-gl.css'  // Import MapLibre CSS
import App from './App.tsx'
import './index.css'

// Enhanced debugging for environment variables
console.log('Environment mode:', import.meta.env.MODE);
console.log('All environment variables:', import.meta.env);
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
console.log('API URL type:', typeof import.meta.env.VITE_API_BASE_URL);

// Clear browser cache if needed
if (!import.meta.env.VITE_API_BASE_URL) {
  console.error('API URL is missing! You might need to clear your browser cache or restart the dev server.');
  console.log('Try opening the app in an incognito window or clearing your cache.');
}

createRoot(document.getElementById("root")!).render(<App />);
