import React from 'react';
import {connect} from 'react-redux';
import constants from '../../constants.js';
import actions from '../../actions.js';

export default connect(
    (state, ownProps) => ({component: constants.tableExamples[state.selectedTableExample], selectedComponentName: state.selectedTableExample}),
    (dispatch, ownProps) => ({onItemClick: name => dispatch(actions.selectTableExample(name))})
)(props => (
    <div style={{height: 'calc(100% - 20px)', padding: 10}}>
        <div style={{height: '50px'}}>
            {Object.keys(constants.tableExamples).map(name => (
                <div 
                    key={`table-example-${name}`}
                    onClick={() => props.onItemClick(name)}
                    style={{
                        float: 'left',
                        width: `${100 / Object.keys(constants.tableExamples).length}%`,
                        paddingTop: 5,
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontWeight: name === props.selectedComponentName ? 'bold': 'normal',
                        color: name === props.selectedComponentName ? '#0202dc': '#000'
                    }}
                >
                    {name}
                </div>
            ))}
        </div>
        <div style={{height: 'calc(100% - 50px)'}}>
            <props.component />
        </div>
    </div>
));