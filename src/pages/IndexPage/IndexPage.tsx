const template_panels = import.meta.env.VITE_TEMPLATE_PANELS === 'true' ? true : false;

import * as RU from '../../locale/ru.json';

import * as packageJson from '../../../package.json';

const version = packageJson.version;

import React, { useEffect, useState, type FC } from 'react';

import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { Panel } from 'primereact/panel';
import { Chip } from 'primereact/chip';

import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';
import { Profile } from '@/components/Profile/Profile';

import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUser } from '@/hooks/useUser';

import { User } from '@/context/UserContext';

import tonSvg from './ton.svg';
import './IndexPage.css';

import { addLocale, locale as Locale } from 'primereact/api';
import { TopMenu } from '@/components/TopMenu/TopMenu';
//import LocaleContext from '@/locale/LocaleContext'

const lng = 'ru';

addLocale(lng, RU.ru);
Locale(lng);

export const IndexPage: FC = () => {
  const LP = retrieveLaunchParams(); console.log('LaunchParams: ', LP);
  
  const tgWebAppData = LP?.tgWebAppData;
  const ID = tgWebAppData;
  const SP = ID?.start_param; console.log('start_param: ', SP);
  
  const username = ID?.user?.username;
  const firstName = ID?.user?.first_name;
  const lastName = ID?.user?.last_name;

  const tgid = ID?.user?.id.toString();

  const name = lastName && firstName && `${firstName} ${lastName}` || username || '';
  //console.log('name: ', name);

  const [userId] = useState<string>(tgid || '');

  const { addUser } = useUser();
  const { user, setUser } = useAuth();
  const { getItem } = useLocalStorage();

  useEffect(() => {
    if (!user) {
      const defaultUser: User = { id: 0, name: '', email: '', password: '', token: '', avatar: '', tgid: tgid }
      const storedUser = JSON.parse(getItem('user')||'{}');
      if (storedUser?.name) { setUser(storedUser) } else { setUser(defaultUser) }
    }
  });



  useEffect(() => {
    user && addUser(user);
  }, [user]);

  return (
    <React.Fragment>
      <Page back={false}>
        <TopMenu />
        <div className='app p-0'/>
        <Profile
          name={name}
          username={username}
          userId={userId}
          bio={user?.bio||''}//{'Судебный юрист с 25.09.2000. Сопровождение споров из неисполнения договорных обязательств, дел о банкротстве, об оспаривании действий органов государственной власти и многих других.'}
        />

        {template_panels && <div className='app p-0'/>}
        {template_panels && <Panel
          className='shadow-5 mx-1'
          header={'Особенности'}
          footer={'Вы можете воспользоваться этими страницами, чтобы узнать больше о функциях, предоставляемых мини-приложениями Telegram и другими полезными проектами'}
        >
          <Link to='/ton-connect'>
            <div className='flex flex-wrap app p-2 align-items-center gap-4'>
              <img
                crossOrigin='anonymous'
                className='w-2-5rem shadow-2 flex-shrink-0 border-round'
                style={{ 
                  backgroundColor: 'var(--tg-theme-accent-text-color)'
                }}
                src={tonSvg}
                alt='TON Connect'
              />
              <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                <span
                  className='app font-size-subheading'
                >TON Connect</span>
                <div className='flex align-items-center gap-2'>
                  {/*<i className="pi pi-tag text-sm"></i>*/}
                  <span
                    className='app font-size theme-hint-color font-weight-content'
                  >
                    Подключите свой кошелек TON
                  </span>
                </div>
              </div>
              {/*<span className="font-bold text-900">$65</span>*/}
            </div>
          </Link>
        </Panel>}
        
        {template_panels && <div className='app p-0'/>}
        {template_panels && <Panel
            className='shadow-5 mx-1'
            header={'Данные о запуске приложения'}
            footer={'Эти страницы помогают разработчикам узнать больше о текущей информации о запуске'}
          >
            <Link to='/init-data'>
              <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
                <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                  <span
                    className='app font-size-subheading'
                  >
                    Данные инициализации
                  </span>
                  <div className='flex align-items-center gap-2'>
                    <span
                      className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                    >
                      Пользовательские данные, информация о чате, технические данные
                    </span>
                  </div>
                </div>
              </div>
            </Link>
            <Link to='/launch-params'>
              <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
                <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                  <span
                    className='app font-size-subheading'
                  >
                    Параметры запуска
                  </span>
                  <div className='flex align-items-center gap-2'>
                    <span
                      className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                    >
                      Идентификатор платформы, версия мини-приложения и т.д.
                    </span>
                  </div>
                </div>
              </div>
            </Link>
            <Link to='/theme-params'>
              <div className='flex flex-wrap app p-2 align-items-center gap-4'>
                <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                  <span
                    className='app font-size-subheading'
                  >
                    Параметры темы
                  </span>
                  <div className='flex align-items-center gap-2'>
                    <span
                      className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                    >
                      Информация о палитре приложений Telegram
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </Panel>}
        
        {template_panels && <div className='app p-0'/>}
        {template_panels && <Panel
            className='shadow-5 mx-1'
            header='База данных и задания'
            footer='Этот раздел помогает разработчикам настроить подключение supabase к своему мини-приложению и организовать подписку на чаты и каналы'
          >
            <Link to='/supabase'>
              <div className='flex flex-wrap app p-2 align-items-center gap-4 item-border-bottom'>
                <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                  <span
                    className='app font-size-subheading'
                  >
                    База данных
                  </span>
                  <div className='flex align-items-center gap-2'>
                    <span
                      className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                    >
                      Идентификаторы пользователей приложения
                    </span>
                  </div>
                </div>
              </div>
            </Link>
            <Link to='/missions'>
              <div className='flex flex-wrap align-items-center gap-4 app p-2'>
                <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                  <span
                    className='app font-size-subheading'
                  >
                    Задания
                  </span>
                  <div className='flex align-items-center gap-2'>
                    <span
                      className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                    >
                      Задания для пользователей, проверка подписки на чаты и каналы
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </Panel>}

        <div
          className='my-5 mx-2 app theme-hint-color theme-bg-secondary text-xs'
        >
          <div className='block text-center mb-2'>
            <Chip className='text-2xs shadow-3' label={'UId: ' + userId}/>
          </div>
          <div className='block text-center mb-2'>
            <span>{'Платформа: ' + LP.tgWebAppPlatform}</span>
          </div>
          <div className='block text-center mb-1'>
            <span>Мини-приложение Telegram</span>
          </div>
          <div className='block text-center mb-1'>
            <span>Версия {version}</span>
          </div>
          <div className='block text-center mb-3'>
            <span>@2024-2025</span>
          </div>
        </div>      
      </Page>
    </React.Fragment>
  );
};
