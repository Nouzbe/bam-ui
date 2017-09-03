import React from 'react';

import { storiesOf } from '@storybook/react';
import { withKnobsOptions, number, color } from '@storybook/addon-knobs';
import withReadme from 'storybook-readme/with-readme';

import Basic from './basic/Table.js';
import Styled from './styled/Table.js';
import Editable from './editable/Table.js';
import Merged from './merged/Table.js';
import LotsOfRows from './lotsOfRows/Table.js';
import LotsOfColumns from './lotsOfColumns/Table.js';

import ReadMe from './README.md';
import BasicReadMe from './basic/README.md';
import StyledReadMe from './styled/README.md';
import EditableReadMe from './editable/README.md';
import MergedReadMe from './merged/README.md';
import LotsOfRowsReadMe from './lotsOfRows/README.md';
import LotsOfColumnsReadMe from './lotsOfColumns/README.md';

const stories = storiesOf('Table', module);

stories.addDecorator(withKnobsOptions({
  debounce: {wait: 100}
}));

stories.add('Basic', withReadme([BasicReadMe, ReadMe], () => {
  const frozenRowsCount = number('Frozen rows', 1);
  const frozenColumnsCount = number('Frozen columns', 2);
  return <Basic frozenRowsCount={frozenRowsCount} frozenColumnsCount={frozenColumnsCount}/>
}));

stories.add('Styled', withReadme([StyledReadMe, ReadMe], () => {
  const background = color('Background', '#676767');
  const frozenBackground = color('Frozen background', '#4c4c4c');
  const borderColor = color('Border color', 'rgb(150, 150, 150)');
  const frozenBorderColor = color('Frozen border color', 'rgb(130, 130, 130)');
  const textColor = color('Color', 'rgb(220, 220, 220)');
  const frozenColor = color('Frozen color', 'rgb(200, 200, 200)');
  const guideColor = color('Guide color', '#404040')
  const handleColor = color('Handle color', 'rgb(187, 187, 187)')
  return (
    <Styled 
      background={background}
      frozenBackground={frozenBackground}
      borderColor={borderColor}
      frozenBorderColor={frozenBorderColor}
      color={textColor}
      frozenColor={frozenColor}
      guideColor={guideColor}
      handleColor={handleColor}
    />
  )
}));

stories.add('Editable', withReadme([EditableReadMe, ReadMe], () => {
  return <Editable />
}));

stories.add('Merged', withReadme([MergedReadMe, ReadMe], () => {
  const frozenColumnsCount = number('Frozen columns', 3);
  const mergedColumnsCount = number('Merged columns', 2);
  return <Merged frozenColumnsCount={frozenColumnsCount} mergedColumnsCount={mergedColumnsCount}/>
}));

stories.add('Lots of Rows', withReadme([LotsOfRowsReadMe, ReadMe], () => {
  return <LotsOfRows /> 
}));

stories.add('Lots of Columns', withReadme([LotsOfColumnsReadMe, ReadMe], () => {
  return <LotsOfColumns />
}));