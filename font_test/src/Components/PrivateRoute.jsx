import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getToken } from '../utils/tokenManager';
import { currenUser } from '../Redux/Auth/Action';

const PrivateRoute = ({ children }) => {
    const token = getToken();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const validateToken = async () => {
            if (token) {
                try {
                    await dispatch(currenUser(token));
                } catch (error) {
                    navigate('/signin');
                }
            }
        };
        validateToken();
    }, [dispatch, token]);
    
    if (!token) {
        return <Navigate to="/signin" />;
    }
    
    return children;
};

export default PrivateRoute;