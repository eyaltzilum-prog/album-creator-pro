// App entry point - v1.5
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { AppProviders } from './providers';
import './index.css';

/**
 * Main entry point - v2
 * ⚠️ ROUTER LIVES HERE — Do NOT add <BrowserRouter>, <Router>, or <MemoryRouter> anywhere else.
 * All route definitions go in App.tsx using <Routes> and <Route>.
 */
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AppProviders>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</AppProviders>
	</StrictMode>,
);
