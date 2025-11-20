import React, { type FC, useMemo } from 'react';
import {
  initData,
  type User,
  useSignal,
} from '@tma.js/sdk-react';

import { DisplayData, type DisplayDataRow } from '@/components/DisplayData/DisplayData.tsx';
import { Page } from '@/components/Page.tsx';

import './InitDataPage.css';

function getUserRows(user: User): DisplayDataRow[] {
  return Object.entries(user).map(([title, value]) => ({ title, value }));
}

export const InitDataPage: FC = () => {
  const initDataRaw = useSignal(initData.raw);
  const initDataState = useSignal(initData.state);

  const initDataRows = useMemo<DisplayDataRow[] | undefined>(() => {
    if (!initDataState || !initDataRaw) {
      return;
    }
    return [
      { title: 'raw', value: initDataRaw },
      ...Object.entries(initDataState).reduce<DisplayDataRow[]>((acc, [title, value]) => {
        if (value instanceof Date) {
          acc.push({ title, value: value.toISOString() });
        } else if (!value || typeof value !== 'object') {
          acc.push({ title, value });
        }
        return acc;
      }, []),
    ];
  }, [initDataState, initDataRaw]);

  const userRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initDataState && initDataState.user
      ? getUserRows(initDataState.user)
      : undefined;
  }, [initDataState]);

  const receiverRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initDataState && initDataState.receiver
      ? getUserRows(initDataState.receiver)
      : undefined;
  }, [initDataState]);

  const chatRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return !initDataState?.chat
      ? undefined
      : Object.entries(initDataState.chat).map(([title, value]) => ({ title, value }));
  }, [initDataState]);

  if (!initDataRows) {
    return (
      <React.Fragment>
        <div>
          <section className="app placeholder">
            <img
              alt="Наклейка Telegram"
              src="https://casebookkiller.github.io/prime-reactjs-template/telegram.gif" 
              style={{display: 'block', width: '144px', height: '144px'}}
            />
            <dl>
              <dt>
                Ой
              </dt>
              <dd>
                Приложение было запущено с отсутствующими данными инициализации
              </dd>
            </dl>
          </section>
        </div>
      </React.Fragment>
    );
  }
  return (
    <Page>
      {<DisplayData header={'Данные инициализации'} rows={initDataRows}/>}
      {userRows && <DisplayData header={'Пользователь'} rows={userRows}/>}
      {receiverRows && <DisplayData header={'Получатель'} rows={receiverRows}/>}
      {chatRows && <DisplayData header={'Чат'} rows={chatRows}/>}
    </Page>
  );
};
