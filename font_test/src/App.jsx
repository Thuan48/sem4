import { Routes, Route } from 'react-router-dom';
import './App.css';
import Status from './Components/Status/Status';
import StatusView from './Components/Status/StatusView';
import Signin from './Components/Register/Signin';
import Signup from './Components/Register/Signup';
import ConfirmEmail from './Components/Register/ConfirmEmail';
import ForgotPasswordCard from './Components/Register/ForgotPasswordCard';
import ResetPasswordCard from './Components/Register/ResetPasswordCard';
import ChangePasswordCard from './Components/Register/ChangePasswordCard';
import Blog from './Components/Blog/Blog';
import CreateBlog from './Components/Blog/CreateBlog';
import { HomePage } from './Components/HomePage';
import FriendPage from './Components/Friends/FriendPage';
import UserProfileCard from './Components/Profile/UserProfileCard';
import PrivateRoute from './components/PrivateRoute';
import UserProfile from './Components/Blog/UserProfile';

function App() {
  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/status" element={<Status />} />
          <Route path="/status/:userId" element={<StatusView />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/confirm" element={<ConfirmEmail />} />
          <Route path="/forgot-password" element={<ForgotPasswordCard />} />
          <Route path="/reset-password" element={<ResetPasswordCard />} />
          <Route path="/change-password" element={<ChangePasswordCard />} />
          <Route path="/friends" element={<FriendPage />} />
          <Route path="/blogs" element={<Blog />} />
          <Route path="/blogs/create" element={<CreateBlog />} />
          <Route path="/update-profile" element={<UserProfileCard handleNavigate={() => navigate(-1)} />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />
          <Route path="/profile/:userId" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </>
  );
}

export default App;
