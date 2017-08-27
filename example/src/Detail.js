import React from 'react';
import {connect} from 'react-redux';
import constants from './constants.js';

class Detail extends React.Component {
  render() {
    return (
      <div style={{height: '100%', width: 'calc(100% - 100px)', float: 'left'}}>
        {this.props.selectedComponent !== undefined ? <this.props.selectedComponent /> : null}
      </div>
    )
  }
}

export default connect(
  (state, ownProps) => ({selectedComponent: constants.components[state.selectedComponent]}),
  (dispatch, ownProps) => ({})
)(Detail);