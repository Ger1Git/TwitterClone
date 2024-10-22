import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homePage/HomePage';
import SignUpPage from './pages/signup/SignUpPage';
import LoginPage from './pages/login/LoginPage';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';

function App() {
	return (
		<div className='flex max-w-6xl mx-auto'>
      <Sidebar />
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/signup' element={<SignUpPage />} />
				<Route path='/login' element={<LoginPage />} />
			</Routes>
      <RightPanel />
		</div>
	);
}

export default App
