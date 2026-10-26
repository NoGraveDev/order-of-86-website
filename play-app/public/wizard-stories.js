import {officialWizards} from './official-wizards.js';
export const wizardStories=Object.fromEntries(Object.entries(officialWizards).map(([id,d])=>[id,d.suggestedStory]));
