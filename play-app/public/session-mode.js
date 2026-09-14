import {account,accountStorage} from './account-state.js';
export function isMultiplayerPath(path){return /^\/play\/multiplayer(?:\.html)?\/?$/.test(path)}
export const multiplayerMode=isMultiplayerPath(location.pathname);
// Gameplay never falls back to browser guest storage. Old saves remain available only for account import.
function signedStorage(){if(!account.user)throw Error('Sign in to play Pawtheon.');return accountStorage;}
export const gameStorage={getItem:k=>signedStorage().getItem(k),setItem:(k,v)=>signedStorage().setItem(k,v),removeItem:k=>signedStorage().removeItem(k)};
