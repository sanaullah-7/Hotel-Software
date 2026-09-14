import { BrowserRouter } from 'react-router-dom';
import { SuperAdminProvider } from './Context/SuperAdminContext.jsx';
import SuperAdminRoutes from './routes/SuperAdminRoutes.jsx';

function App() {
  return (
    <BrowserRouter>
      <SuperAdminProvider>
        <SuperAdminRoutes />
      </SuperAdminProvider>
    </BrowserRouter>
  );
}

export default App;
