import test from 'node:test';
import assert from 'node:assert/strict';
import {validateInput} from '../src/lib/contracts.ts';
const valid=()=>({primary_goal:'income',holding_period:'short',risk_tolerance:'low',tickers:['NVDA'],holding_rationale:'dependable_income'});
test('input contract rejects invalid goals, identity fields and invalid holding selections',()=>{
 for(const input of [{...valid(),primary_goal:'buy'}, {...valid(),email:'private@example.com'}, {...valid(),tickers:[]}, {...valid(),tickers:['NVDA','NVDA']}, {...valid(),tickers:['UNSUPPORTED']}, {...valid(),holding_period:'tomorrow'}, {...valid(),holding_rationale:'buy_more'}, {...valid(),tickers:['NVDA','AAPL']}])assert.throws(()=>validateInput(input));
});
test('validated configuration is copied so later input edits cannot change run attribution',()=>{
 const input=valid();const copy=validateInput(input);input.tickers.push('AAPL');assert.deepEqual(copy.tickers,['NVDA']);
});
