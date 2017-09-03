## Editable Example

Make your table editable by handling the `onChange` callback.

```js
onChange(newCells) {
  const newData = this.state.data.slice(0);
  newCells.map(o => newData[o.rowIdx][o.colIdx] = o.value);
  this.setState({data: newData});
}
```