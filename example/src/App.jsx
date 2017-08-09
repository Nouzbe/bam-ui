import React from 'react';
import {Provider} from 'react-redux';
import {Router, Route} from 'react-router';
import createHistory from 'history/createBrowserHistory';
import Table from 'bam-table';

import store from './store.js';
import actions from './actions.js';

import headers from './data/headers';
import data from './data/data.js';

const history = createHistory();
history.listen((location, action) => {
  const route = location.pathname.substr(1);
  store.dispatch(actions.goto(route));
});

class App extends React.Component {
  makeData() {
    let fatData = [];
    for(let i = 0; i < 100; i++) {
      fatData = fatData.concat(data);
    }
    return fatData;
  }
  render() {
    return (
      <Table headers={headers} data={this.makeData()}/>
    );
  }
}

export default App;