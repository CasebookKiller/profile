import { useEffect, type FC } from 'react';

import { openLink } from '@tma.js/sdk-react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

import { Panel } from 'primereact/panel';

import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';

import './TONConnectPage.css';

export const TONConnectPage: FC = () => {
  const [ TonConnectUI, setOptions ] = useTonConnectUI();
  console.log('TONConnectPage: ', window.location);
  console.log('history:', history);

  setOptions({language: 'ru'});
  useEffect(()=>{
    console.log('TonConnectUI: ', TonConnectUI);
  },[])
  const wallet = useTonWallet();
  
  if (!wallet) {
    return (
      <>
        <section className='ton-connect-page__placeholder flex justify-content-center align-items-center'>
          <dl className='mx-5'>
            <dt className='block text-center app title-font-size title-line-height font-weight-header'>TON Connect</dt>
            <dd className='block text-center mx-0 mt-2'>
              <div className='app font-size-2 theme-hint-color line-height-2'>Для отображения данных, связанных с подключением, необходимо подключить свой кошелек</div>
              <TonConnectButton className='ton-connect-page__button'/>
            </dd>

          </dl>
        </section>
      </>
    );
  }

  const {
    account: { chain, publicKey, address },
    device: {
      appName,
      appVersion,
      maxProtocolVersion,
      platform,
      features,
    },
  } = wallet;

  return (
    <div>
      {'imageUrl' in wallet && (
        <>
          <Panel
            className='shadow-5 mx-1 p-panel-content-top-border'
          >
            <div
              className='flex flex-wrap app p-2 align-items-center gap-4 cursor-pointer'
              onClick={(e) => {
                console.log('onClick');
                e.preventDefault();
                openLink(wallet.aboutUrl);
              }}
            >
              <img
                className='w-2-5rem shadow-2 flex-shrink-0 avatar'
                style={{ backgroundColor: '#007AFF' }}
                src={wallet.imageUrl}
                alt='TON Connect'
              />
              <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                <span
                  className='app font-size-header theme-text-color font-weight-content line-height font-family'
                >{wallet.name}</span>
                <div className='flex align-items-center gap-2'>
                  {/*<i className="pi pi-tag text-sm"></i>*/}
                  <span
                    className='app font-size theme-hint-color font-weight-content'
                  >
                    {wallet.appName}
                  </span>
                </div>
              </div>
            <span className="app font-size-2 theme-hint-color">О кошельке</span>
          </div>
          </Panel>
          <TonConnectButton className='ton-connect-page__button-connected app connect-button'/>
        </>
      )}
      <DisplayData
        header='Учетная запись'
        rows={[
          { title: 'Адрес', value: address },
          { title: 'Цепь', value: chain },
          { title: 'Публичный ключ', value: publicKey },
        ]}
      />
      <DisplayData
        header='Устройство'
        rows={[
          { title: 'Наименование Приложения', value: appName },
          { title: 'Версия Приложения', value: appVersion },
          { title: 'Максимальная версия протокола', value: maxProtocolVersion },
          { title: 'Платформа', value: platform },
          {
            title: 'Особенности',
            value: features
              .map(f => typeof f === 'object' ? f.name : undefined)
              .filter(v => v)
              .join(', '),
          },
        ]}
      />
    </div>
  );
};