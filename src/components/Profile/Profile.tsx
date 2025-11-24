import React, { createContext, FC, useState, useContext, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputTextarea } from "primereact/inputtextarea";
import { FloatLabel } from 'primereact/floatlabel';
import { Dialog } from 'primereact/dialog';
import { Avatar } from 'primereact/avatar';

import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { formDataToJson, getUserProfilePhotos } from '@/api/bot/methods';

import './Profile.css';

import Supabase from '../../supabaseClient';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { getOrderedParams, NumFromB64, Param } from './functions';

const SBaseContext = createContext(Supabase);


interface TGID {
  created_at: string;
  id: number;
  tgid: string;
  username: string | null;
  tgbro: string | null;
}

export interface ProfileProps {
  name: string;
  username?: string;
  userId: string;
  bio: string;
}

export const Profile: FC<ProfileProps> = (props) => {
  const SBase = useContext(SBaseContext);
  //const [ids, setIds] = useState<TGID[]>(); console.log('ids: ', ids);

  const [photo, setPhoto] = React.useState<string>('');
  const [bio, setBio] = useState<string>(props.bio);
  const [bioInvalid, setBioInvalid] = useState<boolean>(false);
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);

  const LP = retrieveLaunchParams();
  //console.log('LaunchParams: ', LP);
  const tgWebAppData = LP?.tgWebAppData;
  const ID = tgWebAppData;
  //console.log('ID: ', ID);
  const SP = ID?.start_param
  //console.log('start_param: ', SP);


  const headerDialog = (
    <div className='inline-flex align-items-center justify-content-center gap-2'>
      <Avatar image={photo} shape='circle' />
      <span className='font-bold white-space-nowrap'>{props.name}</span>
    </div>
  );

  const footerDialog = (
    <div>
      <Button label='Ok' className='profile' icon='pi pi-check' onClick={() => setDialogVisible(false)} autoFocus />
    </div>
  );


  let formData = new FormData(); 
  formData.append('user_id', ID?.user?.id.toString() || '');

/** ******************** */
  async function getIds() {
    const result: PostgrestSingleResponse<TGID[]> = await SBase.from('ids').select();
    //console.log('%cids: %o', `color: firebrick; background-color: white`, result.data);  
    //console.log('ids: ', result.data);//setIds(result.data||[]);
    return result.data||[];
  }

  async function getTGId(tgid: string) {
    const result: PostgrestSingleResponse<TGID[]> = await SBase.from('ids').select().eq('tgid', tgid);
    //console.log('%cid: %o', `color: firebrick; background-color: white`, result.data);  
    return result.data;
  }

  async function checkTGId(tgid: string) {
    const result: PostgrestSingleResponse<TGID[]> = await SBase.from('ids').select().eq('tgid', tgid);
    //console.log('%cid: %o', `color: firebrick; background-color: white`, result.data);  
    return result.data;
  }

  async function addTGId(tgid: string, username?: string) {
    const result = await SBase
      .from('ids')
      .insert([
        { tgid: tgid, username: username },
      ])
      .select();
      //console.log('%cid: %o', `color: firebrick; background-color: white`, result.status);
    return result.data;
  }

  async function addTGIdWithBro(tgid: string, tgbro: string, username?: string) {
    const exist = await SBase
      .from('ids')
      .select('*')
      .eq('tgid', tgid);

    if (exist.data && exist.data.length > 0) {
      console.log('%cid: %o', `color: firebrick; background-color: white`, exist.data);
      return exist.data;
    }

    const result = await SBase
      .from('ids')
      .insert([
        { tgid: tgid, tgbro: tgbro, username: username },
      ])
      .select();
      console.log('%cid: %o', `color: firebrick; background-color: white`, result.status);
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


  /** ******************** */
  useEffect(()=>{
    let bro: string = '';
    const orderedParams: Param[] = getOrderedParams(SP ?? '', SP?.split(/clc|bro/) ?? []) ?? [];
    orderedParams.forEach((item) => {
      if (item.name === 'bro') {
        bro = NumFromB64(item.value).toString();
        item.value = bro;
      }
    });
    //console.log('%corderedParams: ', `background-color: white; color: black;`, orderedParams);

    getIds();
    //console.log('%c BRO:::: %o', 'color: red; background: white;', bro);
    //console.log('%cID: %o', `color: lightgreen`, ID);
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

      checkTGId(ID?.user?.id.toString()).then((result) => {
        const length = result?.length || 0;
        if (length > 0) {
          //console.log('%cid: %o', `color: yellow`, result);  
        } else {
          if (bro !== '' && length === 0) {
            addTGIdWithBro(ID?.user?.id.toString() || '', bro || '', ID?.user?.username || '').then((result) => {
              console.log('%cid: %o', `color: yellow`, result);  
            });
          } else {
            console.log('%cid: %o', `color: yellow`, 'no bro');
            addTGId(ID?.user?.id.toString() || '', ID?.user?.username || '').then((result) => {
              console.log('%cid: %o', `color: yellow`, result);  
            });
          }
        }
      });
      
    }
  },[]);

  getUserProfilePhotos(
    formDataToJson(formData)
  ).then(async (result: any) => {
    if (result?.payload?.ok) {
      const total_count = result?.payload?.result?.total_count;
      const photos = result?.payload?.result?.photos;
      let photo_id = 0;
      if (total_count > 0) {
        const photo = photos[0][0];
        photo_id = photo.file_id;
      }
 
      const botToken = import.meta.env.VITE_BOT_TOKEN;
      const url =  `https://api.telegram.org/bot${botToken}/getFile?file_id=${photo_id}`;

      fetch(url)
      .then(response => {
        return response.json();
      })
      .then(async result=>{
        if (result.ok) {
          const file_path = result.result.file_path;
          const file_url = `https://api.telegram.org/file/bot${botToken}/${file_path}`;

          setPhoto(file_url);

          /*
          let blob: Blob | null = null;

          fetch(file_url).then(response => {
            
            return response.blob();
          }).then((result) => {
            console.log('result: ', result);  
            return result;
          });
          */
          
        }
      })
        
    
    };
  }).catch((error) => {
    console.log(error);
  })

  const title = (
    <div className={'flex justify-content-center'}>{props.name}</div>
  );

  const subtitle = (
    <div>
      {props.username && <div className={'flex justify-content-center my-2'}>@{props.username}</div>}
      <div className={'flex justify-content-center'}>id: {props.userId}</div>
    </div>
  )

  const header = (
    <React.Fragment>
      {
        photo && <div className='flex justify-content-center'>
          <img 
            alt='Профиль' 
            src={photo}
            width={160}
            height={160}
            className='m-3 shadow-5'
          />
        </div>
      }
      
    </React.Fragment>
    
  );
  const footer = (
    <React.Fragment>
      <div style={{textAlign: 'center'}}>
        <Button label='Изменить' className='profile' icon='pi pi-pencil' onClick={() => setDialogVisible(true)} />
        <Button label='Поделиться' className='profile' severity='secondary' icon='pi pi-share-alt' style={{ marginLeft: '0.5em' }} />
      </div>
    </React.Fragment>
  );

  return (
    <div className='card'>
      <div className='card flex justify-content-center'>
        
        <Dialog
          className={'mx-1'}
          visible={dialogVisible}
          header={headerDialog}
          footer={footerDialog}
          style={{ width: '50rem' }}
          onHide={() => {if (!dialogVisible) return; setDialogVisible(false); }}
          modal
        >
              
          <div className='mt-5 card flex justify-content-center'>
            <FloatLabel>
              <InputTextarea
                id='txtbio'
                className='profile'
                value={bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  if (e.target.value.length <= 256) {
                    setBioInvalid(false);
                    setBio(e.target.value);
                  } else {
                    setBioInvalid(true);
                  }
                }}
                rows={10}
                cols={32}
                invalid={bioInvalid}
              />
              <label htmlFor='txtbio'>{bio.length} / 256</label>
            </FloatLabel>
          </div>
        </Dialog>
      </div>
      <Card 
        title={title}
        subTitle={subtitle}
        footer={footer}
        header={header}
        className={'shadow-5 mx-1 p-card'}
      >
        <div style={{textAlign:'justify'}}>
          <div>{bio}</div>
        </div>
      </Card>
    </div>
  )
}
