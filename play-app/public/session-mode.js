import {account,accountStorage} from './account-state.js';
export function isMultiplayerPath(path){return /^\/play\/multiplayer(?:\.html)?\/?$/.test(path)}
export const multiplayerMode=isMultiplayerPath(location.pathname);
const memory=new Map();
// Room sessions never read, overwrite, or reset the player's solo browser saves.
const guestStorage=multiplayerMode?{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)}:{getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v),removeItem:k=>localStorage.removeItem(k)};

export const gameStorage={getItem:k=>account.user?accountStorage.getItem(k):guestStorage.getItem(k),setItem:(k,v)=>account.user?accountStorage.setItem(k,v):guestStorage.setItem(k,v),removeItem:k=>account.user?accountStorage.removeItem(k):guestStorage.removeItem(k)};
