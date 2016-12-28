import React from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import * as TabConfigActions from '../actions/TabConfigActions';

import SampleStore from '../stores/SampleStore'
import * as SampleActions from '../actions/SampleActions'


let hoge = 'hoge'
console.log(SampleStore)
console.log(SampleActions)
class ExampleApp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data:[
        'initial data!'
      ]
    }
    this._loadData = this._loadData.bind(this)
  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  _loadData() {
    this.props.sampleActions.loadData('./data.json')
    setTimeout(()=>{
      this.setState({
        data:this.props.sampleData.items.data
      });
    },1000)

  }


  render() {
    return(
      <div>
        <input type="button" value="load!" onClick={this._loadData} />


          {this.state.data.map((item, index) => (
            <div key={index}>
              {item}
            </div>

          ))}


      </div>
    )
  }

}

ExampleApp.propTypes = {
  sampleData: React.PropTypes.object
};

function getSapmleState() {
  return {
    sample: SampleStore.getSample()
  };
}

// state の中に SampleStore.js の combineReducers で指定したキーの State が全部入ってくる
function mapStateToProps(state) {
  return {
    sampleData: state.SampleReducer
  };
}

function mapDispatchToProps(dispatch) {
  console.log(SampleActions,hoge)
  return {
    sampleActions: bindActionCreators(SampleActions, dispatch)
  };
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExampleApp);
