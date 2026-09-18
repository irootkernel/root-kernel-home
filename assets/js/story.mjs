import {getHome} from './home-story.mjs?v=fe5964d6adc705a5';
import {getTechnologyContent,getProductData,getProductConversation} from './topic-content.mjs?v=fe5964d6adc705a5';
import {getCompanyContent} from './company-content.mjs?v=fe5964d6adc705a5';
export {homeGraph,homeTurns} from './home-story.mjs?v=fe5964d6adc705a5';
const node=(id,label,x,y=51)=>({id,label,x,y});
function topicScenario(items,prefix,version=3) {
  return {version,graph:{nodes:items.map((item,i)=>node(item.id,item.label,75+i*1020/Math.max(1,items.length-1))),edges:items.slice(1).map((item,i)=>({from:items[i].id,to:item.id}))},
    turns:items.map(item=>({id:`${prefix}-${item.id}`,human:item.human,segments:[{id:`${prefix}-${item.id}-answer`,nodeId:item.id,text:item.ai,command:{type:'enter',nodeId:item.id}}],scenes:[{id:`${prefix==='product'?'':`${prefix}-`}${item.id}`,mobile:true}]}))};
}
export function getScenarios(locale = 'ko') {
  const data = getProductData(locale);
  return {
    home:getHome(locale),
    technology:topicScenario(getTechnologyContent(locale),'tech'),
    products:topicScenario(getProductConversation(locale).map(item=>({...item,label:data[item.id].name})),'product',4),
    company:topicScenario(getCompanyContent(locale),'company',1),
  };
}
export const scenarios=getScenarios();
export const {technology,products}=scenarios;

export function contentNavigation(scenario) {
  return scenario.turns.map(turn => {
    const nodeId = turn.segments[0]?.nodeId;
    const node = scenario.graph.nodes.find(item => item.id === nodeId);
    return {id:turn.id,label:node?.label || turn.id};
  });
}
