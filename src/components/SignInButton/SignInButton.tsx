import React, { useEffect, type FC } from 'react';

import { Button } from 'primereact/button';

import { useAuth } from '@/hooks/useAuth';

import SignIn from '@/components/SignIn/SignIn';

export const SignInButton: FC = () => {
  const { user, loginVisible, setLoginVisible } = useAuth();
  useEffect(() => {
    console.log('loginVisible: ', loginVisible);
    console.log('user: ', user);
  },[loginVisible]);
  return (
    <React.Fragment>
      {!user?.name && <div className='card flex justify-content-center'>
        <Button
          label='Войти'
          icon='pi pi-user'
          className='profile'
          onClick={() => {
            setLoginVisible(true);
            console.log('loginVisible: ', loginVisible);
          }} 
        />
        <SignIn/>
      </div>}  
    </React.Fragment>
  );
}