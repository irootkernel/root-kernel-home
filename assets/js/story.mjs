import {getHome} from './home-story.mjs?v=30652883d5c2fd2f';
import {getTechnologyContent,getProductData,getProductConversation} from './topic-content.mjs?v=30652883d5c2fd2f';
import {getCompanyContent} from './company-content.mjs?v=30652883d5c2fd2f';
export {homeGraph,homeTurns} from './home-story.mjs?v=30652883d5c2fd2f';
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
