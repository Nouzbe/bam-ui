import React from 'react';

import { storiesOf } from '@storybook/react';
import { withKnobsOptions, object, number, boolean } from '@storybook/addon-knobs';
import withReadme from 'storybook-readme/with-readme';

import Basic from './basic/Scroller.js';
import Virtual from './virtual/Scroller.js';

import BasicReadMe from './basic/README.md';
import VirtualReadMe from './virtual/README.md';
import ReadMe from './README.md';

const stories = storiesOf('Scroller', module);

stories.addDecorator(withKnobsOptions({
  debounce: {wait: 100}
}));

stories.add('basic', withReadme([BasicReadMe, ReadMe], () => {
  const handleStyle = object('Handle Style', {});
  const guideStyle = object('Guide Style', {});
  const thickness = number('Thickness', 15);
  const floating = boolean('Floating', false);
  return (
    <Basic 
      handleStyle={handleStyle}
      guideStyle={guideStyle}
      thickness={thickness}
      floating={floating}  
    />
  )
}));

stories.add('virtual', withReadme([VirtualReadMe, ReadMe], () => {
  return <Virtual/>
}));