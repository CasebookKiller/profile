export const colors = {
  text: import.meta.env.VITE_TXT_COLOR,
  text_red: import.meta.env.VITE_TXT_COLOR_RED || '',
  accent: import.meta.env.VITE_ACCENT_TEXT_COLOR || '',
  background: import.meta.env.VITE_BACKGROUND_COLOR || '',
  hint: import.meta.env.VITE_HINT_COLOR || '',
}

export const B64chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';

export type Param = {
  name: string,
  index: number,
  value: string
}

export function NumFromB64(encoded: string): number {  
  let arr = encoded.split('.');
  let decoded = 0;
  
  if (arr.length > 1) {
    let whole = 0;
    let decimal = 0;
    for (let i = 0; i < arr[0].length; i++) {  
      const char = arr[0][i];  
      const index = B64chars.indexOf(char);  
      whole = whole * B64chars.length + index;  
    }
    for (let i = 0; i < arr[1].length; i++) {  
      const char = arr[1][i];  
      const index = B64chars.indexOf(char);  
      decimal = decimal * B64chars.length + index;  
    }
    decoded = whole + decimal / 100;
  } else {
    for (let i = 0; i < encoded.length; i++) {  
      const char = encoded[i];  
      const index = B64chars.indexOf(char);  
      decoded = decoded * B64chars.length + index;  
    }  
  }
    
  return decoded;  
}

export function compareProps( a: Param, b: Param ) {
  if ( a.index < b.index ) {
    return -1;
  }
  if ( a.index > b.index ) {
    return 1;
  }
  return 0;
}

export function getOrderedParams(SP: string, arr: string[]) {
  let orderedParams: Param[] = [];
  let params: Param[] = [];

  const unOrderedParams: Param[] = [
    { name: 'clc', index: -1, value: '' },
    { name: 'bro', index: -1, value: '' }
  ];
      
  if (arr.length < 2 && arr.length !== 0) return;  
  if (arr.length !== 0) {
    unOrderedParams.forEach((item) => {
      if (SP?.includes(item.name)) {
        const index = SP.indexOf(item.name);
        
        if (item.name === 'bro') {
          item.index = index;
          const bro = NumFromB64(item.value).toString();
          item.value = bro;
        }

        if (item.name === 'clc') {
          item.index = index;
        }
      }
    });
    orderedParams = unOrderedParams.sort( compareProps );
    
    orderedParams.forEach((item) => {
      if (item.index !== -1) params.push(item);
    })
    params.forEach((item) => {
      console.log('%citem: %o', `color: ${colors.text}`, item);
      console.log('%carr: %o', `color: ${colors.text}`, arr);
      item.value = arr[params.findIndex(x => x.name === item.name)+1];  
    });

    console.log('%cParams: %o', `color: ${colors.text}`, params);
  }

return (params);
}