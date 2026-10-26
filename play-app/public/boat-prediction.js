import {applyBoatCommand} from './boat-race-core.js';
export class BoatPrediction {
 constructor(state,seq=0){this.state=structuredClone(state);this.seq=seq;this.ack=seq;this.pending=[];}
 step(input){if(this.state.done)return;const command={seq:++this.seq,steer:input.steer,brake:!!input.brake,...(input.recover?{recover:true}:{})};this.pending.push(command);applyBoatCommand(this.state,command);return command;}
 accept(state,seq){if(seq<this.ack)return;this.ack=seq;this.pending=this.pending.filter(c=>c.seq>seq);this.state=structuredClone(state);for(const c of this.pending)applyBoatCommand(this.state,c);this.seq=Math.max(this.seq,seq);}
}
