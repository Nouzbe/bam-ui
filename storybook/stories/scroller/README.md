## Scroller Component

### Usage

```js
import Scroller from 'bam-table';

render() {
  return() {
    <Scroller {props}>
      <YourComponent />
    </Scroller>
  }
}
```

### Properties

* `floating` - should scrollbars be displayed at all times or only when the content is hovered
* `onVerticalScroll` - the vertical scroll callback (passes a value between 0 and 1)
* `onHorizontalScroll` - the horizontal scroll callback (passes a value between 0 and 1)
* `verticalScroll` - the vertical scroll value for controlled scrollers
* `horizontalScroll` - the horizontal scroll value for controlled scrollers
* `virtualHeight` - the full height of your underlying virtually scrollable component
* `virtualWidth` - the full width of your underlying virtually scrollable component
* `guideStyle` - the scrollbars guide style
* `handleStyle` - the scrollbars handle style

| propName           | propType | defaultValue | isRequired |
|--------------------|----------|--------------|------------|
| onVerticalScroll   | func     |              |            |
| onHorizontalScroll | func     |              |            |
| verticalScroll     | number   |              |            |
| horizontalScroll   | number   |              |            |
| virtualHeight      | number   |              |            |
| virtualWidth       | number   |              |            |
| guideStyle         | object   |              |            |
| handleStyle        | object   |              |            |