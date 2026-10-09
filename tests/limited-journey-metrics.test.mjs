import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync('public/milana-analytics.js','utf8');
test('La medición distingue acciones sin recoger información financiera o búsquedas escritas',()=>{
 const events=[
 'intent_search_open',
 'intent_search_result_open',
 'guided_choice_selected',
 'guided_next_open',
 'learning_topic_selected',
 'learning_next_open',
 'reading_depth_changed',
 'investment_scenario_edited'
 ];
 for(const e of events)assert.ok(js.includes("'"+e+"'"),e);
 assert.doesNotMatch(js,/searchInput\.value|query\.value|input\.value|FormData\(|\.getAttribute\('value'\)|event\.target\.value/);
 assert.match(js,/let editedInvestmentScenario=false/);
 assert.match(js,/if\(editedInvestmentScenario\)return/);
});
test('Preserva los eventos existentes y reutiliza el proveedor configurado',()=>{
 assert.match(js,/calculator_view/);
 assert.match(js,/calculator_submit/);
 assert.match(js,/internal_to_calculator/);
 assert.match(js,/const ID='G-M4819QE19R'/);
 assert.equal((js.match(/document\.head\.appendChild\(script\)/g)||[]).length,1);
 assert.doesNotMatch(js,/new XMLHttpRequest|sendBeacon\(|fetch\(/);
});