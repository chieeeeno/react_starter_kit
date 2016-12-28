import * as ActionType from '../constants/ActionType';

const initialState = {
  items: [
    'item1111111',
    'item2'
  ]
};


export default function SampleReducer(state = initialState, action) {
  let resData;
  switch (action.type) {
  case ActionType.RESULT: {
    if(action.result) {
      resData = action.result;
    }else{
      resData = state.items
    }
    return Object.assign({}, state, {
      items: resData
    });
  }
  case ActionType.REQUEST: {
    console.log(ActionType.REQUEST)
    // return Object.assign({}, state, {
    //   items: state.items
    // });
  }
  case ActionType.SAVE: {
    return Object.assign({}, state, {
      items: state.items
    });
  }
  default:
    return state;
  }
}
