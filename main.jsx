import React from 'react'; import ReactDOM from 'react-dom/client'; import { ThemeProvider } from 'next-themes'; import App from '@/App.jsx'; import '@/index.css'; ReactDOM.createRoot(document.getElementById('root')).render(<ThemeProvider attribute='class' defaultTheme='dark' enableSystem><App /></ThemeProvider>); then tap Commit changes. Once both index.html and src/main.jsx are committed, Vite will find the entry file immediately, complete the build, and turn Vercel green."
}


