import { Panel } from 'primereact/panel';

export function EnvUnsupported() {

  const headerTemplate = (options: any) => {
    const className = `${options.className} justify-content-space-between`;

    return (
      <div className={className}>
        <div className='flex align-items-center gap-2'>
          <img
            alt='Telegram стикер'
            src='https://xelene.me/telegram.gif'
            style={{ display: 'block', width: '72px', height: '72px' }}
          />
          <span className='font-bold'>Ой</span>
        </div>
      </div>
    );
  };
          
  return (
    <div>
      <div className='app p-0'/>
      <Panel
        className='shadow-5 mx-1'
        headerTemplate={headerTemplate}
      >
        Вы используете слишком старую версию Telegram для запуска этого приложения
      </Panel>
    </div>
  );
}