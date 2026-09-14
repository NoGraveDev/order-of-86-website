import assert from 'node:assert/strict';import {compassBearing} from '../public/compass.js';
for(const [x,z,label,heading] of [[0,-1,'N',0],[1,0,'E',90],[0,1,'S',180],[-1,0,'W',270],[1,-1,'NE',45],[-1,-1,'NW',315]]){const b=compassBearing(x,z);assert.equal(b.label,label);assert.equal(b.heading,heading);}
assert.equal(compassBearing(0,0),null);assert.equal(compassBearing(NaN,1),null);assert.equal(compassBearing(-.0001,-1).heading,0);console.log('PASS compass cardinal/intercardinal bearings, north wrap, invalid/vertical direction guard');
