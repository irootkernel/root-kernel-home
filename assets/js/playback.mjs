export const AI_START = 0.28;
export const AI_END = 0.76;
export const MOBILE_READING_HOLD = 0.18;
export const MOBILE_QUESTION_POSITIONING = 0.12;
export const clamp = value => value < 1e-9 ? 0 : value > 1-1e-9 ? 1 : value;
const segmenters = Object.fromEntries(['ko','en'].map(locale=>[locale,new Intl.Segmenter(locale,{granularity:'grapheme'})]));
export const glyphs = (text,locale='ko') => [...segmenters[locale].segment(text)].map(part=>part.segment);

export function makeTimeline(compiled, mobile = false, locale = 'ko') {
  let start = 0;
  const entries = compiled.turns.map((turn,index) => {
    const scenes = turn.scenes.filter(scene=>!mobile || scene.mobile);
    if (!scenes.length) throw new Error(`No scenes for ${turn.id}`);
    const frames = turn.segments.map(segment=>compiled.frames[segment.frameIndex]);
    const textLength = glyphs(turn.ai,locale).length;
    const positioningDuration = mobile && index > 0 ? MOBILE_QUESTION_POSITIONING : 0;
    const questionStart = start+positioningDuration;
    const answerEnd = questionStart+AI_END;
    let offset = 0;
    const segments = turn.segments.map((segment,i)=>{
      const boundary = positioningDuration + AI_START + offset / textLength * (AI_END-AI_START);
      offset += glyphs(segment.text,locale).length + (i < turn.segments.length-1 ? 1 : 0);
      return {...segment,boundary,frame:frames[i]};
    });
    const length = positioningDuration + (mobile ? 1.1 : 1) + (scenes.length-1)*0.5;
    const holdDuration = mobile && index < compiled.turns.length-1 ? MOBILE_READING_HOLD : 0;
    const entry = {index,start,questionStart,answerEnd,positioningDuration,contentEnd:start+length,end:start+length+holdDuration,holdDuration,turn,frames,segments,scenes};
    start = entry.end;
    return entry;
  });
  return {entries,length:start,mobile,locale};
}

export function locate(timeline, position) {
  const value = Math.max(0,Math.min(timeline.length-0.0001,position));
  const entry = timeline.entries.find(item=>value<item.end) || timeline.entries.at(-1);
  const local = value-entry.start;
  const dialogueLocal = value-entry.questionStart;
  const placementProgress = entry.positioningDuration ? clamp(local/entry.positioningDuration) : 1;
  let segmentIndex = -1;
  entry.segments.forEach((segment,i)=>{ if(local>=segment.boundary-1e-9) segmentIndex=i; });
  const frame = entry.frames[Math.max(0,segmentIndex)];
  const committed = segmentIndex >= 0;
  const mediaProgress = clamp((value-entry.answerEnd)/(entry.contentEnd-entry.answerEnd));
  const sceneIndex = Math.min(entry.scenes.length-1,Math.floor(mediaProgress*entry.scenes.length));
  const holding = entry.holdDuration > 0 && value >= entry.contentEnd;
  const holdProgress = holding ? clamp((value-entry.contentEnd)/entry.holdDuration) : 0;
  return {...entry,local,dialogueLocal,placementProgress,segmentIndex,frame,committed,sceneIndex,mediaProgress,holding,holdProgress,
    snapshot:committed ? frame.after : entry.frames[0].before,
    humanProgress:clamp(dialogueLocal/0.23),aiProgress:clamp((dialogueLocal-AI_START)/(AI_END-AI_START)),
    mediaVisible:value>=entry.answerEnd-1e-9};
}

export function deliveredProgress(timeline, position, index, reducedMotion=false) {
  const local=position-timeline.entries[index].questionStart;
  return {human:local<0?0:reducedMotion?1:clamp(local/0.23),
    ai:local<AI_START?0:clamp((local-AI_START)/(AI_END-AI_START)),committed:local>=AI_START-1e-9};
}

export function messageProgress(timeline,position,frontier,index,reducedMotion=false) {
  const p=deliveredProgress(timeline,position,index,reducedMotion);
  // With reduced motion reveal each whole segment at its command boundary.
  // Future segments still wait, so visible outcomes never precede their events.
  if(reducedMotion && p.committed){
    const entry=timeline.entries[index];
    const available=entry.segments.filter(s=>position-entry.start>=s.boundary-1e-9);
    p.ai=glyphs(available.map(s=>s.text).join(' '),timeline.locale).length/glyphs(entry.turn.ai,timeline.locale).length;
  }
  return {...p,delivered:deliveredProgress(timeline,frontier,index).committed,
    mediaVisible:position>=timeline.entries[index].answerEnd-1e-9};
}

export function sampleScroll(position,target,elapsedMs,idleMs,reducedMotion=false) {
  const distance=target-position;
  if(reducedMotion || idleMs>=240 || Math.abs(distance)>2 || Math.abs(distance)<.0002) return target;
  return position+distance*(1-Math.exp(-Math.min(32,Math.max(0,elapsedMs))/80));
}

export function remapPosition(from,to,position) {
  const point=locate(from,position);
  const target=to.entries.find(entry=>entry.turn.id===point.turn.id);
  if(!target) return 0;
  if(point.holding) return Math.min(target.end-.0001,target.contentEnd+point.holdProgress*target.holdDuration);
  if(point.dialogueLocal<0) return target.start+point.placementProgress*target.positioningDuration;
  if(point.dialogueLocal<AI_END) return target.questionStart+point.dialogueLocal;
  const scene=point.scenes[point.sceneIndex].id;
  const sceneIndex=Math.max(0,target.scenes.findIndex(s=>s.id===scene));
  const withinScene=point.mediaProgress*point.scenes.length-point.sceneIndex;
  const fraction=(sceneIndex+withinScene)/target.scenes.length;
  return Math.min(target.end-.0001,target.answerEnd+fraction*(target.contentEnd-target.answerEnd));
}

export function mobileChatOffset({top,fullHeight,viewHeight,mediaHeight,answerHeight,aiProgress,placementProgress,mediaProgress,previousBottom=0}) {
  const textHeight = fullHeight-mediaHeight;
  const answerTextHeight = answerHeight-mediaHeight;
  const visibleTextHeight = textHeight-answerTextHeight+answerTextHeight*aiProgress;
  const previousOffset = Math.max(0,previousBottom-viewHeight+44);
  const questionTarget = Math.max(previousOffset,top+textHeight-answerTextHeight-viewHeight*.68);
  const textOffset = Math.max(questionTarget,top+visibleTextHeight-viewHeight+44);
  const questionOffset = previousOffset+(textOffset-previousOffset)*placementProgress;
  const mediaOffset = Math.max(textOffset,top+fullHeight-viewHeight+44);
  return questionOffset+(mediaOffset-questionOffset)*mediaProgress;
}

export function navigatePosition(timeline,position,direction) {
  const point=locate(timeline,position);
  const stops=timeline.entries.flatMap(entry=>entry.scenes.map((_,i)=>Math.min(entry.end-.0001,entry.answerEnd+(i+(timeline.mobile?1:.95))/entry.scenes.length*(entry.contentEnd-entry.answerEnd))));
  if(direction>0) return stops.find(stop=>stop>position+.01) ?? position;
  if(position<=point.start+.01) return [...stops].reverse().find(stop=>stop<point.start) ?? 0;
  return point.index ? stops.filter(stop=>stop<point.start).at(-1) : 0;
}
