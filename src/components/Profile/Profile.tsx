import React, { createContext, FC, useState, useContext, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputTextarea } from "primereact/inputtextarea";
import { FloatLabel } from 'primereact/floatlabel';
import { Dialog } from 'primereact/dialog';
import { Avatar } from 'primereact/avatar';

import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { formDataToJson, getChat, getUserProfilePhotos } from '@/api/bot/methods';

import { useForm, SubmitHandler } from "react-hook-form"

import SBase, { addTGId, addTGIdWithBro, checkTGId, getIds, getRow, TGID, updateTGBio, updateTGUser, updateTGUsername } from '@/supabaseClient';

import { getOrderedParams, NumFromB64, Param } from './functions';

import { useUser } from '@/hooks/useUser';
import { User } from '@/context/UserContext';

const SBaseContext = createContext(SBase);

import './Profile.css';

export interface ProfileProps {
  name: string;
  username?: string;
  userId: string;
  bio?: string;
}

type FormBio = {
  txtbio: string;
}

export const Profile: FC<ProfileProps> = (props) => {
  const SBase = useContext(SBaseContext);

  //const [ids, setIds] = useState<TGID[]>(); console.log('ids: ', ids);
  const [id, setId] = useState<TGID>();
  const [bro, setBro] = useState<TGID>();

  const [photo, setPhoto] = React.useState<string>('');
  const [bio, setBio] = useState<string>();
  const [bioInvalid, setBioInvalid] = useState<boolean>(false);
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);

  const { user, setUser } = useUser();
  
  const LP = retrieveLaunchParams();
  //console.log('LaunchParams: ', LP);
  const tgWebAppData = LP?.tgWebAppData;
  const ID = tgWebAppData;
  //console.log('ID: ', ID);
  const SP = ID?.start_param
  //console.log('start_param: ', SP);

  const tgid = ID?.user?.id.toString() || '';
  //console.log('tgId: ', tgId);

  useEffect(() => {
    getChat(
      tgid,
      (result: any) => {
        if (result.payload.ok) {
          console.log('%cchat: %o', `color: firebrick; background-color: white`, result.payload.result);  
        }
      },
      (error: any) => {
        console.log('%cerror: ', `background-color: white; color: red;`, error);
      }
    );

    getRow(tgid).then((result: any) => {
      if (result?.length > 0) {
        setBio(result[0].bio);
      }
    })
  }, []);

  const headerDialog = (
    <div className='inline-flex align-items-center justify-content-center gap-2'>
      <Avatar image={photo} shape='circle' />
      <span className='font-bold white-space-nowrap'>{props.name}</span>
    </div>
  );

  const footerDialog = (
    <div>
      <Button type='submit' label='Ok' className='profile' icon='pi pi-check' onClick={() => setDialogVisible(false)} autoFocus />
    </div>
  );


  let formData = new FormData();
  console.log(props.userId);
  formData.append('user_id', ID?.user?.id.toString() || '');

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

    getIds(SBase);
    //console.log('%c BRO:::: %o', 'color: red; background: white;', bro);
    //console.log('%cID: %o', `color: lightgreen`, ID);
    if (ID?.user?.id) {
      
      getRow(ID?.user?.id.toString()).then((result) => {
        if (result && result.length > 0) {
          const username = ID?.user?.username || '';
          const firstName = ID?.user?.first_name || '';
          const lastName = ID?.user?.last_name || '';
          const lng = ID?.user?.language_code || '';
          const is_premium = ID?.user?.is_premium || false;
          
          if (result[0].username === null) {
            updateTGUsername(ID?.user?.id.toString() || '', username).then((result) => {
              console.log('%cUpdatedId: %o', `color: lightgreen`, result);
            });
          } else {
            updateTGUser(tgid, username, firstName, lastName, lng, is_premium).then((result) => {
              console.log('%cUpdatedId: %o', `color: lightgreen`, result);
            })
          }

          console.log('%cid: %o', `color: lightgreen`, result[0]);
          setId(result[0]);
          getRow(result[0].tgbro?.toString() || '').then((result) => {
            if (result && result.length > 0) {
              setBro(result[0]);
            }  
          })
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
    //console.log('result: ', result);
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
          //console.log('%curl: ','color: red;', file_url)
          setPhoto(file_url);
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
      {props.username && <div className={'flex justify-content-center my-2'}><span className='profile mx-1'>@{props.username}</span></div>}
      {props.userId && <div className={'flex justify-content-center my-2'}>ид: <span className='profile mx-1'>{props.userId}</span></div>}
      {bro?.username && <div className={'flex justify-content-center my-2'}>приглашён: <span className='profile mx-1'>{bro?.username}</span></div>}
      {id?.created_at && <div className={'flex justify-content-center my-2'}>добавлен: <span className='profile mx-1'>{new Date(id?.created_at).toLocaleDateString()}</span></div>}
      {id?.is_premium && <div className={'flex justify-content-center my-2'}>премиум: <span className='profile mx-1 pi pi-check'></span></div>}
      {id?.lng && <div className={'flex justify-content-center my-2'}>язык: <span className='profile mx-1'>{id?.lng}</span></div>}      
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


  const { handleSubmit, setValue } = useForm<FormBio>({
    defaultValues: {
      txtbio: bio?.toString(),
    },
  });
  
  const onSubmit: SubmitHandler<FormBio> = (data) => {
    console.log(data);
    alert('kjlkjl')
  };

  return (
    <div className='card'>
      <div className='card flex justify-content-center'>
        <Dialog
          className={'mx-1'}
          visible={dialogVisible}
          header={headerDialog}
          footer={footerDialog}
          style={{ width: '50rem' }}
          onHide={() => {
            if (!dialogVisible) return;
            setDialogVisible(false);
          }}
          modal
        >
          <form onSubmit={handleSubmit(onSubmit)}>    
            <div className='mt-5 card flex justify-content-center'>
              <FloatLabel>
                <InputTextarea
                  id='txtbio'
                  className='profile'
                  value={bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    if (e.target.value.length <= 256) {
                      setValue('txtbio', e.target.value);

                      setBioInvalid(false);
                      setBio(e.target.value);
                      if (bio !== e.target.value) {
                        setUser({ ...user, bio: e.target.value } as User);
                        updateTGBio(tgid, e.target.value);   
                      }

                    } else {
                      setBioInvalid(true);
                    }
                  }}
                  rows={10}
                  cols={32}
                  invalid={bioInvalid}
                />
                <label htmlFor='txtbio'>{bio ? bio.length : 0} / 256</label>
              </FloatLabel>

              
              
            </div>
            <Button type='submit' label='Ok' className='profile' icon='pi pi-check' onClick={() => setDialogVisible(false)} autoFocus />

          </form>
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
