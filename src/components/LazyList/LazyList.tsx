import '@/components/LazyList/LazyList.css';

import { JSX, RefObject, useEffect, useRef, useState } from 'react';

import { IBond, TIBond } from '@/api/tbank/types';
import { Tag } from 'primereact/tag';
import { convertTIBond, getRiskLevel, getRiskLevelText, getSeverity, getStatus } from '@/api/tbank/methods';
import { BookmarkButton } from '../BookmarkButton/BookmarkButton';
import { Rating } from 'primereact/rating';
import { fetchBonds } from '@/utils/common';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const HOST = import.meta.env.VITE_HOST;
const PORT = import.meta.env.VITE_PORT;

const allBonds: IBond[] = [
  // Ваши реальные данные облигаций
];

// Новый подход: берем данные из массива, а не генерируем их заново
const BOND_PAGE_SIZE = 10; // Количество облигаций на одну страницу подгрузки

// Основной компонент LazyLoader
const LazyList = () => {
  const [currentPage, setCurrentPage] = useState(0); // Текущая страница подгрузки
  
  const [allBonds, setAllBonds] = useState<IBond[]>([]);
  
  const [bonds, setBonds] = useState<IBond[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLUListElement | null>(null);

  const { user } = useAuth();
  const { getItem } = useLocalStorage();
  
  const [/*fullaccess*/, setFullAccess] = useState<string>();
  const [/*readonly*/, setReadOnly] = useState<string>();
  const [/*sandbox*/, setSandBox] = useState<string>();

  // Массив для хранения ссылок на элементы
  const itemRefs = useRef<Array<RefObject<HTMLDivElement | null>>>([]);
  
  useEffect(() => {
    getAllBonds();
  }, []);

  function getAllBonds() {
    const data = getItem('tokens');
    const tokens = JSON.parse(data || '{}');
    
    if (data) {
      if (tokens.fullaccess) setFullAccess(tokens.fullaccess);
      if (tokens.readonly) setReadOnly(tokens.readonly);
      if (tokens.sandbox) setSandBox(tokens.sandbox);
      
    }
    if (tokens.readonly === '' && tokens.fullaccess === '' && tokens.sandbox === '') return;
    const ttoken = tokens.readonly !== '' ? tokens.readonly : tokens.fullaccess !== '' ? tokens.fullaccess : tokens.sandbox !== '' ? tokens.sandbox : '';
      
    if (!user?.token) return;

    if (ttoken !== '') fetchBonds(`http://${HOST}:${PORT}/getBonds`, ttoken, user?.token)
    .then(res => {
      return res.json();
    }).then(res => {
      let allbonds: IBond[] = [];
      res.forEach((bond: TIBond) => {
        allbonds.push(convertTIBond(bond));
      })
      setAllBonds(allbonds);
    });
  }

  // Получаем фрагмент данных из исходного массива
  const loadNextPage = () => {
    const startIdx = currentPage * BOND_PAGE_SIZE;
    const endIdx = startIdx + BOND_PAGE_SIZE;
    const nextBonds = allBonds.slice(startIdx, endIdx);
    
    if (nextBonds.length > 0) {
      setBonds(prevBonds => [...prevBonds, ...nextBonds]);
      setCurrentPage(currentPage + 1);
    }
  };

  // Асинхронная подгрузка данных
  /*
  const handleFetchMore = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Имитация задержки сети
    const nextBatch = generateBonds(bonds.length, 10);
    setBonds(prevBonds => [...prevBonds, ...nextBatch]);
    setIsLoading(false);
  };
  */
   // Загрузка следующей страницы облигаций
  const handleFetchMore = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки
    loadNextPage();
    setIsLoading(false);
  };

  // Обработчик события scroll
  const onScrollHandler = () => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = containerRef.current;
      if ((scrollHeight - clientHeight - scrollTop) <= 100 /* Threshold */) {
        !isLoading && handleFetchMore();
      }
    }
  };

  // Наблюдение за событием scroll
  useEffect(() => {
    window.addEventListener('scroll', onScrollHandler);
    return () => {
      window.removeEventListener('scroll', onScrollHandler);
    };
  }, [isLoading]);

  // Шаблон элемента списка об`лигаций
  const ItemTemplate = ({ data }: { data: IBond }): JSX.Element => {
    const elementRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (!itemRefs.current.find((item) => item.current?.id === elementRef.current?.id)) {
        //console.log('elementRef: ', elementRef);
        itemRefs.current.push(elementRef);
      }
    }, [elementRef]);

    return (
      <div 
        id={'lazy_'+data.isin}
        ref={elementRef}
        className='col-12'
      >
        <div className='flex flex-column md:flex-row md:align-items-start p-1 gap-1' style={{minWidth: '300px'}}>
          <div className='flex overflow-hidden flex-column sm:flex-row justify-content-between align-items-top md:align-items-start sm:flex-1 gap-1'>
            <div className='flex flex-column align-items-center sm:align-items-start gap-1'>
              <div className='flex flex-column gap-1'>
                <div className='text-md font-bold'>{data.name}</div>
                <div className=''>{data.isin}</div>
              </div>
              <div className='flex flex-column gap-1'>
                {/*<Rating value={data.rating} readOnly cancel={false}></Rating>*/}
                <span className='flex align-items-center gap-1'>
                  {/*<i className='pi pi-tag product-category-icon'></i>*/}
                  <Rating
                    className={'bonds'}
                    value={getRiskLevel(data) ?? 0}
                    alt={getRiskLevelText(data) ?? ''}
                    readOnly
                    cancel={false}
                    stars={3}
                  />
                  {/*<span className={classNames('font-semibold', 'text-' + getRiskLevel(data))}>{getRiskLevelText(data)}</span>*/}
                </span>
              </div>
            </div>
            <div className='flex w-4 flex-row sm:flex-column align-items-center sm:align-items-end gap-1 md:gap-1'>
              <span className='text-md font-semibold'>{Number(data.nominal.units).toLocaleString('ru-RU')} ₽</span>
              <BookmarkButton isin={data.isin} />
              <Tag className='bonds' value={getStatus(data)} severity={getSeverity(data)}></Tag>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='p-datascroller-content'>
      <ul id='ullist' className='p-datascroller-list' ref={containerRef}>
        {bonds.map(bond => (
          <ItemTemplate key={'lazy_'+bond.isin} data={bond} />
        ))}
        {isLoading && <li className='list-group-item'>Загрузка...</li>}
      </ul>  
    </div>
  );
};


/*  
// ОСНОВНОЙ КОМПОНЕНТ LazyLoader
const LazyList = () => {
  const [data, setData] = useState<ItemType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomElemRef = useRef<HTMLDivElement | null>(null);

  // Асинхронная подгрузка данных
  const handleFetchMore = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки сети
    setData(prevData => [
      ...prevData,
      ...generateNewItems(10),
    ]);
    setIsLoading(false);
  };

  // Наблюдение за элементом внизу списка
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]: any[]) => {
        if (entry.isIntersecting) {
          handleFetchMore();
        }
      },
      { threshold: 1 }
    );

    if (bottomElemRef.current) {
      observer.observe(bottomElemRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="container">
      <ul className="list-group">
        {data.map(({ id, title }) => (
          <li key={id} className="list-group-item">
            {title}
          </li>
        ))}
        {isLoading && <li className="list-group-item">Загрузка...</li>}
        {!isLoading && <div ref={bottomElemRef}></div>}
      </ul>
    </div>
  );
};
*/

export default LazyList;