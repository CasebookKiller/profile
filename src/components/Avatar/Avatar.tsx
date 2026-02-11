import React, { FC, useState, useEffect } from 'react';

import Base64Image from '@/components/Base64Image/Base64Image';

import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { fetchWithToken } from '@/utils/common';

const HOST = import.meta.env.VITE_HOST;
const PORT = import.meta.env.VITE_PORT;

export interface AvatarProps {
  tgid?: string | number;
  token?: string;
  className?: string;
  onClick?: () => void;
  width?: number;
  height?: number;
};

export const Avatar: FC<AvatarProps> = ({ 
  tgid,
  token,
  className,
  onClick,
  ...rest
}) => {
  const [ avatarSrc, setAvatarSrc ] = useState<string | null>(null);
  const { logout } = useAuth();
  const { user, setUser } = useUser();
  
  useEffect(() => {
    try {
      // запрос API
      if (!token) return;
      
      fetchWithToken(`http://${HOST}:${PORT}/avatar?tgid=${tgid}`, token)
      .then(res => {
        console.log('res: ', res);
        return res.json();
      })
      .then(res => {
        setAvatarSrc(res.avatar);
        if (user?.avatar === '' || user?.avatar === null ) {
          const avatar = res.avatar !== user?.avatar ? res.avatar : '';
          setUser({ ...user, avatar: avatar });
        } 
      }).catch(error => {
        console.log('Ошибка получения доступа: ', error);
        logout();
      });
      
    } catch (error) {
      console.log(error);
    }
  }, [tgid, token]);

  const Load: FC = () => {
    const out = !avatarSrc ? <p>Загрузка...</p> : <p>Нет аватара</p>;

    return out;
  }

  return (
    <React.Fragment>
      {avatarSrc ? <div onClick={onClick} className='flex align-content-center align-items-center'><Base64Image
          base64={avatarSrc! || ''}
          mimeType = {'image/jpeg'}
          alt='Аватар'
          className={className}
          {...rest}
        /></div> : <Load/>
      }
    </React.Fragment>
  );
}