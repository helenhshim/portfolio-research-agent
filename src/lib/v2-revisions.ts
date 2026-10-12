// Per-session UI state primitive. No shared/global storage or persistence.
export type V2TurnToken={session_id:string;turn_id:string;revision:number};
export class V2RevisionGate<T> {
 #session:string;#revision=0;#active:V2TurnToken|null=null;#artifact:T|null=null;
 constructor(sessionId:string){this.#session=sessionId;}
 begin(turnId:string):V2TurnToken {
  if(this.#active)throw new Error('run_already_active');
  const token={session_id:this.#session,turn_id:turnId,revision:++this.#revision};this.#active=token;return {...token};
 }
 #matches(token:V2TurnToken){return Boolean(this.#active&&token.session_id===this.#session&&token.turn_id===this.#active.turn_id&&token.revision===this.#active.revision);}
 commit(token:V2TurnToken,artifact:T){if(!this.#matches(token))return false;this.#artifact=structuredClone(artifact);this.#active=null;return true;}
 fail(token:V2TurnToken){if(!this.#matches(token))return false;this.#active=null;return true;}
 stop(token:V2TurnToken){return this.fail(token);}
 get artifact(){return structuredClone(this.#artifact);}
}
