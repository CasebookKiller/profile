import React, { FC, ReactNode, useEffect, useState } from 'react';

import { openTelegramLink, shareURL, retrieveLaunchParams } from '@tma.js/sdk-react';

import { ChevronRight, Check2, Exclamation, Share } from 'react-bootstrap-icons';

import { Panel } from 'primereact/panel';
import { PrimeReactProvider } from 'primereact/api';
import { Timeline } from 'primereact/timeline';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';

import { botMethod } from '@/api/bot/methods';

import './MissionsPage.css';

export const PrimeReactFlex = ({ children }: { children: ReactNode }) => {
  return (
    <div className="p-inputgroup flex-1">
      {children}
    </div>
  )
}

interface Mission {
  id: number;
  title: string;
  marker: ReactNode;
  after?: string;
  cb?: () => string;
}

export const MissionsPage: FC = () => {
  const LP = retrieveLaunchParams();
  const tgWebAppData = LP?.tgWebAppData;
  const ID = tgWebAppData;

  //const refs = useRef<AntButtonRef[]>([]);
  
  const DefaultMarker = <div className='p-timeline-event-marker' data-pc-section='marker'/>;
  const DisabledMarker = <div className='p-timeline-event-marker-disabled' data-pc-section='marker'/>;

  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 1,
      title: 'Подписаться на новости',
      marker: DefaultMarker,
      after: 'waiting', // 'waiting', 'success', 'error', 'checking', 'share'
      cb: () => {
        console.log('%ccasebook{killer} channel', `color: pink`);
        let formData = new FormData();
        console.log(ID?.user?.id);
        formData.append('chat_id', '-1002212964660');
        formData.append('user_id', ID?.user?.id.toString() || '');
        botMethod(
          'getChatMember',
          formData
        ).then((result: any) => {
          console.log(result);
          console.log(result.payload?.result?.status);
          if (result.payload?.result?.status === 'member') {
            setAfter(1, 'success');
            setDisabled(1);
            setMarker(1,'disabled');
          } else {
            setActive(1);
            setAfter(1, 'waiting');
            setMarker(1,'active');

            if (openTelegramLink.isAvailable()) {
              openTelegramLink('https://t.me/casebookkiller');
            }
          }
        }).catch((error) => {
          console.log(error);
          setAfter(1, 'error');
        })
        return 'checking';
      }
    },
    {
      id: 2,
      title: 'Поделиться',
      marker: DefaultMarker,
      after: 'share',
      cb: () => {
        console.log('случился вызов share...')
        const url = 'https://t.me/' + import.meta.env.VITE_BOT_NAME;
        const msg = `Приложение для расчета неустойки: ${url}`;
        shareURL(msg);
        return 'share';
      }
    }
  ]);

  function setActive(id: number) {
    setMissions((missions) => missions.map((mission) => mission.id === id ? {...mission, status: 'active'} : mission));
  }

  function setMarker(id: number, status: string) {
    if (status === 'active') setMissions((missions) => missions.map((mission) => mission.id === id ? {...mission, marker: DefaultMarker} : mission));
    if (status === 'disabled') setMissions((missions) => missions.map((mission) => mission.id === id ? {...mission, marker: DisabledMarker} : mission));
  }

  function setDisabled(id: number) {
    setMissions((missions) => missions.map((mission) => mission.id === id ? {...mission, status: 'disabled'} : mission));
  }

  function setAfter(id: number, after: string) {
    setMissions((missions) => missions.map((mission) => mission.id === id ? {...mission, after} : mission));
  }

  function checkMission(task: Mission) {
    console.log('%cid: %o', `color: yellow`, task.id);
    // здесь необходимо обходить выполнение колбэка при статусе share
    const status = task.after === 'share' ? 'share' : task.cb ? task.cb(): 'waiting';
    
    return status; //'waiting', 'success', 'error', 'checking', 'share'
  }

  function updateMissions() {
    setMissions((missions) => {
      return missions.map((mission) => {
        return {...mission, after: checkMission(mission)};
      });
    });
  }

  useEffect(() => {
    updateMissions();
  }, []);

  return (
    <div className="MissionsPage">
      <Panel
          className='shadow-5 mx-1 mt-1 mb-2'
          header={'Задания'}
          footer={'Выполнение заданий помогает приложению развиваться и улучшаться'}
      >
        <PrimeReactProvider>
          <Timeline
            align={'left'}
            value={missions}
            marker={(item) => item.marker}
            className='mb-2'
            content={(item) => {
              console.log('%citem: %o', `color: cyan`, item);

              return (
                <React.Fragment>
                  <Button
                    className={item.status === 'disabled' ? 'app disabled text-base' : 'app default text-base'}
                    style={{width: '100%'}}
                    disabled={item.status === 'disabled'}
                    outlined={true}
                    onClick={() => {
                      console.log('КЛИК', item);
                      // здесь должна быть проверка на share
                      if (item.after === 'share') {
                        item.cb();
                      } else {
                        setMissions(missions.map((mission) => {
                          if (mission.id === item.id) {
                            //if (task.cb) task.cb();
                            return {
                              ...mission,
                              after: 'checking'
                            };
                          }
                          return mission;
                        }));
                        console.log('%citem.id: %o','color: yellow', item.id);
                        setMissions(missions.map((mission) => {
                          if (mission.id === item.id) {
                            //if (task.cb) task.cb();
                            return {...mission, after: checkMission(mission)};
                          }
                          return mission;
                        }));
                      }
                    }}
                    
                  >
                    <PrimeReactFlex>
                      <div style={{width: '80%', textAlign: 'left'}}>{item.title}</div>
                      <div style={{width: '20%', textAlign: 'right'}}>
                        {item.after === 'waiting' && <ChevronRight style={{position: 'relative', marginLeft: '0.5rem', top: '0.2rem', width: '1rem', height: '1rem', stroke: 'var(--tg-theme-accent-text-color)'}} strokeWidth="2" fill="var(--tg-theme-accent-text-color)"/>}
                        {item.after === 'checking' && <ProgressSpinner style={{marginLeft: '0.5rem', top: '0.2rem', width: '1rem', height: '1rem'}} strokeWidth="4" fill="var(--surface-ground)" animationDuration=".5s"/>}
                        {item.after === 'success' && <Check2 style={{position: 'relative', marginLeft: '0.5rem', top: '0.2rem', width: '1rem', height: '1rem', stroke: 'var(--tg-theme-hint-color)'}} strokeWidth="2" fill="var(--tg-theme-accent-text-color)"/>}
                        {item.after === 'error' && <Exclamation style={{position: 'relative', marginLeft: '0.5rem', top: '0.2rem', width: '1rem', height: '1rem', stroke: 'var(--tg-theme-destructive-text-color)'}} strokeWidth="1"/>}
                        {item.after === 'share' && <Share style={{position: 'relative', marginLeft: '0.5rem', top: '0.2rem', width: '1rem', height: '1rem', stroke: 'var(--tg-theme-accent-text-color)'}} strokeWidth="1"/>}
                      </div>
                    </PrimeReactFlex>
                  </Button>
                </React.Fragment>
              );
            }}
          />
        </PrimeReactProvider>
      </Panel>
    </div>
  );
};
