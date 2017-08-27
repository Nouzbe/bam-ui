import React from 'react';
import {connect} from 'react-redux';
import actions from './actions.js';
import constants from './constants.js';

export default connect(
  (state, ownProps) => ({selectedComponent: state.selectedComponent}),
  (dispatch, ownProps) => ({onItemClick: name => dispatch(actions.selectComponent(name))})
)(props => (
  <div className="list">
      {Object.keys(constants.components).map(k => (
      <div key={`component-${k}`} className="list-item" onClick={() => props.onItemClick(k)} style={props.selectedComponent === k ? {background: '#fff'} : {}}>
          <div style={{height: '100%', display: 'table-cell', verticalAlign: 'middle'}}>{k}</div>
      </div>
      ))}
  </div>
));