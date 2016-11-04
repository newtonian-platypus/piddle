import React from 'react';
import ReactDOM from 'react-dom';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import BillList from './index';
import Bill from './../Bill';

const deleteBill = sinon.spy();

const props = {
  shallow: {
    deleteBill,
    bills: [
      { description: 'a', price: 1 },
      { description: 'b', price: 2 },
      { description: 'c', price: 3 },
    ],
  },
};

const renderedComponent = {
  shallow: {
    new: shallow(
      <BillList
        {...props.shallow}
        interactionType={Symbol.for('new')}
      />
    ),
    delete: shallow(
      <BillList
        {...props.shallow}
        interactionType={Symbol.for('delete')}
      />
    ),
  },
};

describe('new', () => {
  const component = renderedComponent.shallow.new;

  it('renders without crashing', () => {
    ReactDOM.render(
      <BillList
        {...props.shallow}
        interactionType={Symbol.for('new')}
      />,
      // eslint-disable-next-line no-undef
      document.createElement('div'),
    );
  });

  it('has a bill for each provided bill ', () => {
    expect(component.find(Bill))
      .to.have.length(props.shallow.items.length);
  });
});

describe('delete', () => {
  const component = renderedComponent.shallow.delete;

  it('renders without crashing', () => {
    ReactDOM.render(
      <BillList
        {...props.shallow}
        interactionType={Symbol.for('new')}
      />,
      // eslint-disable-next-line no-undef
      document.createElement('div'),
    );
  });

  it('should have one less bill after a deletion', () => {
    expect(component.find(Bill))
      .to.have.length(props.shallow.items.length - 1);
  });
});

