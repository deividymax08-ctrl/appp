export const storageService = {
  save: (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  load: (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  remove: (key: string) => {
    localStorage.removeItem(key);
  }
};
