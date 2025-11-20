import { emitEvent, isTMA, mockTelegramEnv } from '@tma.js/sdk-react';

// Важно имитировать среду только в целях разработки.
// При сборке приложения import.meta.env.DEV станет ложным,
// а код внутри него будет удалён,
// поэтому вы не увидите его в итоговом пакете.
if (import.meta.env.DEV) {
  if (!await isTMA('complete')) {
    const themeParams = {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5',
    } as const;
    const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

    mockTelegramEnv({
      onEvent(e) {
        // Здесь вы можете написать собственные обработчики для всех известных методов Telegram Mini Apps:
        // https://docs.telegram-mini-apps.com/platform/methods
        if (e.name === 'web_app_request_theme') {
          return emitEvent('theme_changed', { theme_params: themeParams });
        }
        if (e.name === 'web_app_request_viewport') {
          return emitEvent('viewport_changed', {
            height: window.innerHeight,
            width: window.innerWidth,
            is_expanded: true,
            is_state_stable: true,
          });
        }
        if (e.name === 'web_app_request_content_safe_area') {
          return emitEvent('content_safe_area_changed', noInsets);
        }
        if (e.name === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', noInsets);
        }
      },
      launchParams: new URLSearchParams([
        // Узнайте больше о параметрах запуска: 
        // https://docs.telegram-mini-apps.com/platform/launch-parameters#parameters-list
        ['tgWebAppThemeParams', JSON.stringify(themeParams)],
        // Здесь указываются ваши инициализированные данные. Подробнее об этом можно узнать здесь:
        // https://docs.telegram-mini-apps.com/platform/init-data#parameters-list
        //
        // Обратите внимание, что для корректной инициализации данных необходимо передавать их в том виде, в котором они
        // отправляются из приложения Telegram. Это необходимо на случай, если вы будете сортировать их ключи
        // (auth_date, hash, user и т.д.) или значения по-своему, проверка исходных данных будет более
        // скорее всего, произойдет сбой на стороне вашего сервера. Итак, чтобы убедиться, что вы работаете с действительным инициализатором
        // data, лучше взять настоящий файл из вашего приложения и вставить его сюда. Это должно быть
        // выглядит примерно так (параметры поиска по правильно закодированному URL-адресу):
        // ```
        // user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22...
        // ```
        ['tgWebAppData', new URLSearchParams([
          ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
          ['hash', import.meta.env.VITE_MOCK_HASH || 'some-hash'],
          ['signature', import.meta.env.VITE_MOCK_SIGNATURE || 'some-signature'],
          ['start_param', import.meta.env.VITE_MOCK_START_PARAM || 'debug'],
          ['chat_instance', import.meta.env.VITE_MOCK_CHAT_INSTANCE || 'some-instance'],
          ['chat_type', 'sender'],
          ['user', JSON.stringify({
            id: Number(import.meta.env.VITE_MOCK_USER_ID) || 99281932,
            first_name: 'Ivan',
            last_name: 'Petrov',
            username: 'petrov',
            language_code: 'ru',
            is_premium: true,
            allows_write_to_pm: true,
          })],
        ]).toString()],
        ['tgWebAppVersion', '9.1'],
        ['tgWebAppPlatform', 'tdesktop'],
      ]),
    });

    console.info(
      '⚠️ До тех пор, пока текущая среда не считалась средой на основе Telegram, она имитировалась. Обратите внимание, что этого не следует делать в рабочей среде, а текущее поведение характерно только для процесса разработки. Имитация среды также применяется только в режиме разработки. Таким образом, после сборки приложения вы не увидите такого поведения и связанного с ним предупреждения, которое приводит к сбою приложения вне Telegram.',
    );
  }
}
