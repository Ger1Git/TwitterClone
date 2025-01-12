import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/homePage/HomePage';
import SignUpPage from './pages/signup/SignUpPage';
import LoginPage from './pages/login/LoginPage';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import Search from './components/Search';
import NotificationPage from './pages/notification/NotificationPage';
import LoadingSpinner from './components/LoadingSpinner';
import ProfilePage from './pages/profile/ProfilePage';
import { Toaster, toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import apiUrl from '../utils/config';

function App() {
    const { data: authUser, isLoading } = useQuery({
        queryKey: ['authUser'],
        queryFn: async () => {
            try {
                const res = await fetch(`${apiUrl}/api/auth/account`);
                let data;

                if (res.ok) {
                    data = await res.json();
                } else {
                    return null;
                }

                if (data.error) return null;

                return data;
            } catch (error) {
                toast.error('Please login to continue');
            }
        },
        retry: false
    });

    if (isLoading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex max-w-6xl mx-auto">
            {authUser && <Sidebar />}
            <Routes>
                <Route
                    path="/"
                    element={authUser ? <HomePage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/signup"
                    element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/login"
                    element={!authUser ? <LoginPage /> : <Navigate to="/" />}
                />
                <Route
                    path="/notifications"
                    element={
                        authUser ? (
                            <NotificationPage />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/profile/:username"
                    element={
                        authUser ? <ProfilePage /> : <Navigate to="/login" />
                    }
                />
            </Routes>
            {authUser && <RightPanel />}
            <Toaster />
        </div>
    );
}

export default App;
