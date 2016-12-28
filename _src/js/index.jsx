import React from 'react'
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import ExampleApp from './components/ExampleApp.jsx';
import createFinalStore from './stores/SampleStore';

const store = createFinalStore();
const rootElement = document.getElementById('root');

ReactDOM.render(
  <Provider store={store}>
    <ExampleApp />
  </Provider>,
  rootElement
)
