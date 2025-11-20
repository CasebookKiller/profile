import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { routes } from '@/navigation/routes.tsx';
import React from 'react';

export function App() {
  const LP = retrieveLaunchParams(); console.log('LaunchParams: ', LP);
  
  const tgWebAppData = LP?.tgWebAppData;
  const ID = tgWebAppData; console.log('ID: ', ID?.user?.id);

  routes.push();

  return (
    <React.Fragment>
      {true && <div>
        <HashRouter>
          <Routes>
            {routes.map((route) => <Route key={route.path} {...route} />)}
            <Route path='*' element={<Navigate to='/'/>}/>
          </Routes>
        </HashRouter>
      </div>}
    </React.Fragment>
  );
}
