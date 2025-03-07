import { useCallback } from 'react';
import { useNavigate as useRouterNavigate } from 'react-router-dom';

export const useNavigate = () => {
  const navigate = useRouterNavigate();

  const navigateToLanding = useCallback(() => {
    navigate('/');
  }, []);

  return {
    navigateToLanding
  };
};