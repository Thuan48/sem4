import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { confirmEmail } from '../../Redux/Auth/Action';

const ConfirmEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const emailConfirmation = useSelector((state) => state.auth.emailConfirmation);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');

    if (email) {
      dispatch(confirmEmail(email));
    }
  }, [location.search, dispatch]);

  useEffect(() => {
    if (emailConfirmation) {
      if (emailConfirmation.success) {
        navigate('/signin', { replace: true, state: { message: 'Email confirmed successfully. Please sign in.' } });
      } else {
        navigate('/signin', { replace: true, state: { message: emailConfirmation.message || 'Email confirmation failed.' } });
      }
    }
  }, [emailConfirmation, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h2 className="text-2xl font-semibold mb-4">Email Confirmation</h2>
        {emailConfirmation ? (
          emailConfirmation.success ? (
            <p className="text-green-600">Confirming your email...</p>
          ) : (
            <p className="text-red-600">Confirming your email...</p>
          )
        ) : (
          <p>Confirming your email...</p>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;