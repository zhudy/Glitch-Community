import React from 'react';
import { storiesOf } from '@storybook/react';
import Button from '../src/components/buttons/button';

storiesOf('Button', module)
  .add('regular', () => (
    <Button>Hello Button</Button>
  ))
  .add('cta', () => (
    <Button type="cta">CTA Button</Button>
  ))
  .add('small', () => (
    <Button size="small">Small Button</Button>
  ))
.add('tertiary', () => (
    <Button type="tertiary" size="small">Tertiary (Small) Button</Button>
  ))
.add('danger zone', () => (
    <Button type="dangerZone" size="small">Destructive Action</Button>
  ));