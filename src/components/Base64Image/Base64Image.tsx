interface Base64ImageProps {
  base64: string;
  mimeType?: string; // опционально: тип изображения
  alt?: string;     // опционально: альтернативный текст
  className?: string; // опционально: классы CSS
  width?: number; // опционально: ширина изображения
  height?: number; // опционально: высота изображения
}

const Base64Image: React.FC<Base64ImageProps> = ({
  base64,
  mimeType = 'image/jpeg',
  alt = '',
  className,
  ...rest
}) => {
  if (!base64) { return <span>Нет изображения</span> } 

  const src = `data:${mimeType};base64,${base64}`;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={rest.width}
      height={rest.height}
      onError={(e) => {
        console.error('Ошибка загрузки изображения из Base64', e);
      }}
    />
  );
};

export default Base64Image;