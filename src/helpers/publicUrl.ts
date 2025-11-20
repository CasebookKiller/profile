/**
 * @returns Полный общедоступный URL-адрес с префиксом общедоступной базы статических ресурсов.
 * @param path - путь к добавлению префикса
 */
export function publicUrl(path: string): string {
  // baseUrl должен заканчиваться косой чертой. Причина в том, что если baseUrl будет
  // равен "/my-base", то передача пути, равного "tonconnect-manifest.json", не будет выполняться.
  // выдайте нам ожидаемый результат, на самом деле это будет "/tonconnect-manifest.json", но ожидаемый
  // один из них - "/my-base/tonconnect-manifest.json". Это связано с конструктором URL.
  let baseUrl = import.meta.env.BASE_URL;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }

  let isBaseAbsolute = false;
  try {
    new URL(baseUrl);
    isBaseAbsolute = true;
  } catch { /* пусто */
  }

  return new URL(
    // Путь не должен начинаться с косой черты, так как это приведет к разрыву
    // базового URL. Например, если базовый URL и путь "/my-base/"
    // равно "/tonconnect-manifest.json", мы получим ожидаемый результат не как
    // "/my-base/tonconnect-manifest.json", а как "/tonconnect-manifest.json".
    path.replace(/^\/+/, ''),
    isBaseAbsolute
      ? baseUrl
      : window.location.origin + baseUrl,
  ).toString();
}