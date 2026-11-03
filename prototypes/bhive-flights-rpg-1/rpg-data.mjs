export const TOOLS = {
  lantern: {name:'Amber Lantern',ability:'Scout',symbol:'◇',description:'Bring back a clue about what helped or got in the way.',prompt:'What did you notice along the way?'},
  satchel: {name:'Gatherer’s Satchel',ability:'Prepare',symbol:'▱',description:'Pack one small first step and carry it through the quest.',prompt:'What is your first tiny step?'},
  cloak: {name:'Moss Cloak',ability:'Lighten',symbol:'⌁',description:'Choose a gentler version of the objective before you leave.',prompt:'Make room for a smaller quest.'}
};
export const QUESTS = {
  gather: {title:'The Small Provision',subtitle:'A little care, carried home.',story:'Your Forager waits beside an empty basket. What could make today a little easier?',routes:{
    prepare:{name:'Prepare something',description:'Make one useful thing ready for later.',objective:'Prepare one small thing that supports you.',example:'Fill a water bottle for later.',gentle:'Put one useful thing within reach.'},
    outside:{name:'Take the open path',description:'Make room for a little fresh air.',objective:'Find a comfortable moment outside.',example:'Step outside for a short pause.',gentle:'Pause by a window or doorway, if that suits you.'}
  }},
  look: {title:'The Hidden Clue',subtitle:'A small discovery is enough.',story:'A faint trail runs through the chamber. Your Forager can follow one thread. Which one?',routes:{
    energy:{name:'Follow your energy',description:'Notice a moment when your energy shifts.',objective:'Notice one change in your energy today.',example:'Notice how I feel around lunchtime.',gentle:'Notice how your energy feels right now.'},
    surroundings:{name:'Read your surroundings',description:'Notice what makes a space feel easier.',objective:'Notice one helpful thing in your surroundings.',example:'Find a place where I feel comfortable.',gentle:'Notice one comfortable detail where you are.'}
  }},
  rest: {title:'A Quiet Landing',subtitle:'Some journeys make room to stop.',story:'The hive is humming. Your Forager finds two ways to make a little quiet. Which feels right?',routes:{
    pause:{name:'Find a quiet moment',description:'Give yourself a little room to pause.',objective:'Make space for a small, comfortable pause.',example:'Put my phone away for ten minutes.',gentle:'Set one thing down and pause for a moment.'},
    lighten:{name:'Leave something behind',description:'Set aside a demand that can wait.',objective:'Let one non-essential thing wait.',example:'Leave one optional chore until another day.',gentle:'Choose one thing you do not need to decide right now.'}
  }}
};
export function objectiveFor(kind,quest) {
  const route=QUESTS[kind].routes[quest.route];
  return quest.gentle?route.gentle:route.objective;
}
