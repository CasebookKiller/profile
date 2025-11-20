import type { FC } from 'react';

import { themeParams, useSignal } from '@tma.js/sdk-react';

import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';
import { Page } from '@/components/Page.tsx';

export const ThemeParamsPage: FC = () => {
  const tp = useSignal(themeParams.state);

  return (
    <Page>
      <div>
        <DisplayData
          header={'Параметры темы'}
          rows={
            Object
              .entries(tp)
              .map(([title, value]) => ({
                title: title
                  .replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
                  .replace(/background/, 'bg'),
                value,
              }))
          }
        />
      </div>
    </Page>
  );
};
