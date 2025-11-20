import React, { createContext, FC, useContext, useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { Panel } from 'primereact/panel';
import { Page } from '@/components/Page';

import Supabase from '../../supabaseClient';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

import './SupabasePage.css';

const SBaseContext = createContext(Supabase);

/**
 * Запись в таблице ids
 */
interface TGID {
  created_at: string;
  id: number;
  tgid: string;
  username: string;
}

export const SupabasePage: FC = () => {
  const SBase = useContext(SBaseContext); 
  const [ids, setIds] = useState<TGID[]>([]);

  const LP = retrieveLaunchParams();
  const ID = LP?.tgWebAppData;

  async function getIds() {
    const result: PostgrestSingleResponse<TGID[]> = await SBase
      .from('ids')
      .select()
      .lt('id', 10); //первые 10 записей

    console.log('%cids: %o', `color: firebrick; background-color: white`, result.data);  
    
    setIds(result.data||[]);
  }

    async function getTGId(tgid: string) {
    const result: PostgrestSingleResponse<TGID[]> = await SBase.from("ids").select().eq('tgid', tgid);
    console.log('%cid: %o', `color: firebrick; background-color: white`, result.data);  
    return result.data;
  }

  async function updateTGUsername(tgid: string, username: string) {
    const result = await SBase
      .from('ids')
      .update({ username: username })
      .eq('tgid', tgid)
      .select();
      console.log('%cid: %o', `color: firebrick; background-color: white`, result.status);
    return result.data;
  }

  useEffect(() => {
    if (ID?.user?.id) {
      getTGId(ID?.user?.id.toString()).then((result) => {
        if (result && result.length > 0) {
          if (result[0].username === null) {
            updateTGUsername(ID?.user?.id.toString() || '', ID?.user?.username || '').then((result) => {
              console.log('%cUpdatedId: %o', `color: lightgreen`, result);
            });
          }
        }
      });
    }
    getIds();
  }, []);
  
  function rectifyFormat(s: string) {
    const b = s.split(/\D/);
    return b[0] + '-' + b[1] + '-' + b[2] + 'T' +
           b[3] + ':' + b[4] + ':' + b[5] + '.' +
           b[6].substring(0,3) + '+00:00';
  }

  return (
    <React.Fragment>
      <Page>
        <SBaseContext.Provider value={Supabase}>
          <div className="SupabasePage">
            <Panel
              className='shadow-5 mx-1 mt-1 mb-2'
              header={'Пользователи'}
            >
              {ids.map((id) => { 
                
                return (
                  <div
                    key={id.id} 
                    className='flex flex-wrap align-items-center gap-4 app p-2'
                  >
                    <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                      <span
                        className='app font-size-subheading'
                      >
                        {id.id} - {id.tgid}{id.username ? ` - ${id.username}` : ''}
                      </span>
                      <div className='flex align-items-center gap-2'>
                        <span
                          className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                        >
                          {new Date(rectifyFormat(id.created_at)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Panel>
          </div>
        </SBaseContext.Provider>
      </Page>
    </React.Fragment>
  );
};
