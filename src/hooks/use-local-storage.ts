"use client";

import { useState, useEffect, useCallback } from 'react';

function isClient() {
  return typeof window !== 'undefined';
}

// A wrapper for window.localStorage that supports server-side rendering.
const safeLocalStorage = {
  getItem(key: string) {
    if (!isClient()) {
      return null;
    }
    return window.localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (!isClient()) {
      return;
    }
    window.localStorage.setItem(key, value);
  },
};

// This function is to be called on the client side only.
function getInitialValue<T>(key: string, initialValue: T) {
  if (!isClient()) {
    return initialValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => getInitialValue(key, initialValue));

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (!isClient()) {
      console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
      return;
    }

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      safeLocalStorage.setItem(key, JSON.stringify(valueToStore));
      window.dispatchEvent(new StorageEvent("storage", { key }));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(getInitialValue(key, initialValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue]);


  return [storedValue, setValue];
}
