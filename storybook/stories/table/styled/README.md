## Styled Example

Control the style of the table through its `cellRenderer` property.

```js
const cellRenderer = props => (
  <div 
    style={{
      background: props.frozen ? '#4c4c4c' : '#676767',
      color: props.frozen ? 'rgb(200, 200, 200)' : 'rgb(220, 220, 220)',
      borderRight: props.frozen ? '1px solid rgb(130, 130, 130)' : '1px solid rgb(150, 150, 150)',
      borderBottom: props.frozen ? '1px solid rgb(130, 130, 130)' : '1px solid rgb(150, 150, 150)',
      boxSizing: 'border-box',
      height: '100%',
      padding: 5
    }}
  >
    {props.cell}
  </div>
);
```