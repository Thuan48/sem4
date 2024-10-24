import { useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import './App.css';
import { HomePage } from './Components/HomePage';
import Status from './Components/Status/Status';
import StatusView from './Components/Status/StatusView';
import Signin from './Components/Register/Signin';
import Signup from './Components/Register/Signup';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/status" element={<Status />} />
          <Route path="/status/:userId" element={<StatusView />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
