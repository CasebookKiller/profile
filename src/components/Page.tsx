import React, { type PropsWithChildren, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { backButton } from '@tma.js/sdk-react';

export function Page({ children, back = true }: PropsWithChildren<{
  /**
   * Верно, если с этой страницы можно вернуться назад.
   */
  back?: boolean
}>) {
  const navigate = useNavigate();

  useEffect(() => {
    if (back) {
      backButton.show();
      return backButton.onClick(() => {
        navigate(-1);
      });
    }
    backButton.hide();
  }, [back]);

  return <React.Fragment>{children}</React.Fragment>;
}