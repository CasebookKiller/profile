import type { FC } from 'react';

import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';
import { Page } from '@/components/Page.tsx';

export const LaunchParamsPage: FC = () => {
  const LP = retrieveLaunchParams();

  return (
    <Page>
      <div>
        <DisplayData
          header={'Параметры запуска'}
          rows={[
            { title: 'tgWebAppPlatform', value: LP.tgWebAppPlatform },
            { title: 'tgWebAppShowSettings', value: LP.tgWebAppShowSettings },
            { title: 'tgWebAppVersion', value: LP.tgWebAppVersion },
            { title: 'tgWebAppBotInline', value: LP.tgWebAppBotInline },
            { title: 'tgWebAppStartParam', value: LP.tgWebAppStartParam },
            { title: 'tgWebAppData', type: 'link', value: '/init-data' },
            { title: 'tgWebAppThemeParams', type: 'link', value: '/theme-params' },
          ]}
        />
      </div>
    </Page>
  );
};
