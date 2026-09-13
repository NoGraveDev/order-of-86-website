// Keep contextual actions in one layout flow instead of competing fixed positions.
export function createActionDock(){
 const dock=document.createElement('section');dock.id='actionDock';dock.setAttribute('aria-label','Nearby actions');
 // Toasts share the action column on desktop so feedback cannot cover its button.
 const toast=document.getElementById('toast');if(toast)dock.append(toast);
 for(const id of ['interact','mazeEnter','sunwardCharge','sledRaceStart','boatRaceStart']){const button=document.getElementById(id);if(button)dock.append(button);}
 document.body.append(dock);return dock;
}
