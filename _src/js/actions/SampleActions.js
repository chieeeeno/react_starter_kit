import Axios from 'axios';
import * as ActionType from '../constants/ActionType';

export function loadData(url) {
  console.log(url)
  return dispatch => {
    dispatch(loadDataRequest());
    Axios({
      url: url,
      timeout: 20000,
      method: 'get',
      responseType: 'json'
    }).then((response)=>{
      console.log(response.data)
      dispatch(loadDataResult(response.data))
    }).catch((error)=>{
      alert('error')
      console.error('loadData',error)
      dispatch(loadDataResult(false))
    })
  };
}

function loadDataRequest() {
  return {
    type: ActionType.REQUEST
  };
}

function loadDataResult(result) {
  return {
    type: ActionType.RESULT,
    result,
  };
}
