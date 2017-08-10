import React from 'react';
import ColumnBody from './ColumnBody.js';
import Header from './Header.js';
import style from './style.js';

class Column extends React.Component {
    constructor(props) {
        super(props);
        this.onWidthChange = this.onWidthChange.bind(this); 
    }
    onWidthChange(newWidth) {
        this.props.onColumnWidthChange(this.props.colIdx, newWidth);
    }
    render() {
        return <div className={style('bt-column')} style={{width: `${this.props.columnWidth}px`}}>
            <Header 
                header={this.props.header} 
                height={this.props.headerHeight}
                onWidthChange={this.onWidthChange}/>
            <ColumnBody 
                colIdx={this.props.colIdx} 
                data={this.props.data}
                rowHeights={this.props.rowHeights}
                onRowHeightChange={(idx, newHeight) => this.props.onRowHeightChange(idx, newHeight - this.props.headerHeight - this.props.offsetTop)}
                offsetTop={this.props.offsetTop}
            />
        </div>
    }
}

export default Column;