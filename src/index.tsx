const erudaon = false;

import 'primereact/resources/themes/lara-dark-cyan/theme.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

// Сначала включите стили пользовательского интерфейса Telegram, чтобы наш код мог переопределять CSS пакета.
import './index.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';

// Имитируем среду на случай, если мы находимся за пределами Telegram.
import './mockEnv.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  const launchParams = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  const debug = (launchParams.tgWebAppStartParam || '').includes('debug')
    || import.meta.env.DEV;

  // Настройте все зависимости приложения.
  await init({
    debug,
    eruda: erudaon && debug && ['ios', 'android'].includes(platform),
    mockForMacOS: platform === 'macos',
  })
    .then(() => {
      root.render(
        <StrictMode>
          <Root/>
        </StrictMode>,
      );
    });
} catch (e) {
  root.render(<EnvUnsupported/>);
}