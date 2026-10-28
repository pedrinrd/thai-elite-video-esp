import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installVercelApiFallback } from './services/vercelApiFallback';

installVercelApiFallback();

createRoot(document.getElementById('root')!).render(<App />);

