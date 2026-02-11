import { TonConnectUIProvider } from '@tonconnect/ui-react';

import { StrictMode, type FC } from 'react';
import { PrimeReactProvider } from 'primereact/api';

import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';

import { UserProvider } from '@/context/UserProvider';

import { publicUrl } from '@/helpers/publicUrl.ts';

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div>
      <p>Произошла необработанная ошибка:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}


interface InnerProps {
  Component: FC;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageProps: any;
}

const Inner: FC<InnerProps> = ({ Component, pageProps }) => {
  console.log('Запуск приложения');
  
  return (
    <StrictMode>
      <PrimeReactProvider>
        <UserProvider>
          <Component {...pageProps}/>
        </UserProvider>
      </PrimeReactProvider>
    </StrictMode>
  );
};

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <TonConnectUIProvider
        manifestUrl={publicUrl('tonconnect-manifest.json')}
      >
        <Inner
          Component={App}
          pageProps={{title: 'Профиль'}}
        />
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}
