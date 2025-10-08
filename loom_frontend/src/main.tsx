import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Header from './ui/header.tsx';

createRoot(document.getElementById('root')!).render(
  <>
    <Header />
    <App />
  </>
);