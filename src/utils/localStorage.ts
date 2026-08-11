export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to local storage', error);
  }
};

export const getData = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error getting data from local storage', error);
    return null;
  }
};

export const updateData = <T>(key: string, data: Partial<T>): void => {
  try {
    const existingData = getData<T>(key);
    if (existingData) {
      const updatedData = { ...existingData, ...data };
      saveData(key, updatedData);
    }
  } catch (error) {
    console.error('Error updating data in local storage', error);
  }
};

export const deleteData = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting data from local storage', error);
  }
};

export const clearData = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing local storage', error);
  }
};
