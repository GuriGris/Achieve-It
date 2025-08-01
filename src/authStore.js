import { useSyncExternalStore } from 'react';

let data = null;
const dataListeners = new Set();

export function setData(newData) {
    if (typeof newData === "function") {
        console.warn("Refused to set data to a function. You probably meant to use a React setState updater.");
        return;
    }
    data = newData;
    dataListeners.forEach(l => l());
}

export function useData() {
  return useSyncExternalStore(
    (listener) => { dataListeners.add(listener); return () => dataListeners.delete(listener); },
    () => data
  );
}

let user = null;
let token = null;

export const setAuthData = (authUser, authToken) => {
    user = authUser;
    token = authToken;
};

export const getUser = () => user;
export const getToken = () => token;