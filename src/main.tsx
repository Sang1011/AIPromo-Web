
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store/index.ts'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
console.log();

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#140f2a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)"
            }
          }}
        />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </Provider>,
)
