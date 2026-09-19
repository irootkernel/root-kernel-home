import {getHomeCopy} from './home-copy.mjs?v=c2e532ba3ebb92d1';

const node = (id, label, x, y = 51) => ({id, label, x, y});
const edge = (from, to, kind) => ({from, to, ...(kind ? {kind} : {})});
const enter = nodeId => ({type:'enter', nodeId});
const complete = (nodeId, revision, summary) => ({type:'complete',nodeId,outcome:'pass',evidence:{id:`${nodeId}-r${revision}`,summary}});
const roles = ['architect','security','reliability'];
const fork = revision => ({type:'fork',forkId:`review-r${revision}`,branches:roles.map(nodeId=>({id:`${nodeId}-r${revision}`,nodeId,required:true}))});
const result = (role, revision, outcome, summary) => ({type:'result',forkId:`review-r${revision}`,branchId:`${role}-r${revision}`,outcome,evidence:{id:`${role}-evidence-r${revision}`,summary}});
const join = revision => ({type:'join',forkId:`review-r${revision}`,nodeId:'review'});
const segment = (id,nodeId,text,command) => ({id,nodeId,text,command});
const turn = (id,human,scene,segments,mobileInline = true) => ({
  id,
  human,
  segments,
  scenes:[{id:scene,mobile:true,...(mobileInline ? {} : {mobileInline:false})}],
});

export function getHome(locale = 'ko') {
const copy = getHomeCopy(locale);
const homeGraph = {
  nodes:[node('intro',copy.nodes["intro"],65),node('approach',copy.nodes["approach"],193),node('design',copy.nodes["design"],327),node('build',copy.nodes["build"],461),node('test',copy.nodes["test"],595),
    node('architect',copy.nodes["architect"],758,16),node('security',copy.nodes["security"],758,51),node('reliability',copy.nodes["reliability"],758,86),
    node('review',copy.nodes["review"],949),node('founder',copy.nodes["founder"],1083),node('services',copy.nodes["services"],1217),node('products',copy.nodes["products"],1351)],
  edges:[edge('intro','approach'),edge('approach','design'),edge('design','build'),edge('build','test'),
    ...roles.flatMap(role=>[edge('test',role),edge(role,'review')]),
    edge('review','build','rollback'),edge('review','founder','success'),edge('founder','services'),edge('services','products')],
  forks:[{sourceNodeId:'test',joinNodeId:'review',requiresPass:true,branches:roles.map(nodeId=>({nodeId,required:true}))}],
};

const displayGraph = {
  nodes:[node('design',copy.nodes["design"],65),node('build',copy.nodes["build"],215),node('test',copy.nodes["test"],365),
    node('architect',copy.nodes["architect"],565,16),node('security',copy.nodes["security"],565,51),node('reliability',copy.nodes["reliability"],565,86),
    node('review',copy.nodes["review"],780)],
  edges:[edge('design','build'),edge('build','test'),
    ...roles.flatMap(role=>[edge('test',role),edge(role,'review')]),edge('review','build','rollback')],
  forks:[{sourceNodeId:'test',joinNodeId:'review',requiresPass:true,branches:roles.map(nodeId=>({nodeId,required:true}))}],
};

const homeTurns = [
  turn('hello',copy.questions["hello"],'identity',[
    segment('company','intro',copy.answers["company"],enter('intro'))],false),
  turn('approach',copy.questions["approach"],'approach',[
    segment('control','approach',copy.answers["control"],enter('approach'))],false),
  turn('todo-design',copy.questions["todo-design"],'todo-design',[
    segment('design-start','design',copy.answers["design-start"],enter('design'))]),
  turn('todo-build',copy.questions["todo-build"],'todo-build',[
    segment('build-start','build',copy.answers["build-start"],enter('build')),
    segment('build-done','build',copy.answers["build-done"],complete('build',1,copy.evidence["build-r1"]))]),
  turn('todo-test',copy.questions["todo-test"],'todo-test',[
    segment('test-start','test',copy.answers["test-start"],enter('test')),
    segment('test-pass','test',copy.answers["test-pass"],complete('test',1,copy.evidence["test-r1"]))]),
  turn('review-start',copy.questions["review-start"],'todo-review-start',[
    segment('review-fork','test',copy.answers["review-fork"],fork(1))]),
  turn('review-result',copy.questions["review-result"],'todo-review-result',[
    segment('architect-first','architect',copy.answers["architect-first"],result('architect',1,'pass',copy.evidence["architect-evidence-r1"])),
    segment('security-first','security',copy.answers["security-first"],result('security',1,'pass',copy.evidence["security-evidence-r1"])),
    segment('reliability-first','reliability',copy.answers["reliability-first"],result('reliability',1,'fail',copy.evidence["reliability-evidence-r1"])),
    segment('review-join-first','review',copy.answers["review-join-first"],join(1))]),
  turn('todo-fix',copy.questions["todo-fix"],'todo-fix',[
    segment('return-build','build',copy.answers["return-build"],{type:'rollback',nodeId:'build',reason:copy.rollback["return-build"],invalidates:['build','test',...roles,'review']}),
    segment('build-fixed','build',copy.answers["build-fixed"],complete('build',2,copy.evidence["build-r2"]))]),
  turn('todo-retest',copy.questions["todo-retest"],'todo-retest',[
    segment('retest-start','test',copy.answers["retest-start"],enter('test')),
    segment('retest-pass','test',copy.answers["retest-pass"],complete('test',2,copy.evidence["test-r2"]))]),
  turn('rereview-start',copy.questions["rereview-start"],'todo-rereview-start',[
    segment('rereview-fork','test',copy.answers["rereview-fork"],fork(2))]),
  turn('rereview-result',copy.questions["rereview-result"],'todo-rereview-result',[
    segment('architect-second','architect',copy.answers["architect-second"],result('architect',2,'pass',copy.evidence["architect-evidence-r2"])),
    segment('security-second','security',copy.answers["security-second"],result('security',2,'pass',copy.evidence["security-evidence-r2"])),
    segment('reliability-second','reliability',copy.answers["reliability-second"],result('reliability',2,'pass',copy.evidence["reliability-evidence-r2"])),
    segment('review-join-second','review',copy.answers["review-join-second"],join(2))]),
  turn('founder',copy.questions["founder"],'founder-responsibility',[
    segment('founder','founder',copy.answers["founder"],enter('founder'))]),
  turn('services',copy.questions["services"],'services',[
    segment('services','services',copy.answers["services"],enter('services'))]),
  turn('products',copy.questions["products"],'products-overview',[
    segment('products','products',copy.answers["products"],enter('products'))]),
];

return {version:6,greeting:copy.greeting,graph:homeGraph,displayGraph,turns:homeTurns};
}

export const home = getHome();
export const homeGraph = home.graph;
export const homeDisplayGraph = home.displayGraph;
export const homeTurns = home.turns;
