import React from 'react';
import { Button } from 'react-bootstrap';
import './BillItemList.css';
import BillItem from './../BillItem';

/**
 * @class BillItemList
 * @param {object} props
 * @param {object[]} props.items
 * @param {function} props.deleteBillItem
 * @param {function} props.changeBillItem
 * @param {symbol} props.interactionType
 * @param {function} props.newBillItem
 */
const BillItemList = (props) => {
  const isEditable = (
    props.interactionType === Symbol.for('new')
    || props.interactionType === Symbol.for('edit')
  );

  return (
    <div className="BillItemList">
      {props.items.map((item, i) => (
        <BillItem
          key={i}
          index={i}
          {...item}
          deleteBillItem={props.deleteBillItem}
          splitBillItem={props.splitBillItem}
          changeBillItem={props.changeBillItem}
          claimBillItem={props.claimBillItem}
          interactionType={props.interactionType}
        />
        ))}
      {isEditable &&
        <div className="row">
          <Button
            className="pull-right"
            id="new-bill-item-btn"
            bsStyle="success"
            onClick={props.newBillItem}
          >New Bill Item
          </Button>
        </div>
      }
    </div>
  );
};

BillItemList.propTypes = {
  items: React.PropTypes.arrayOf(
    React.PropTypes.object
  ).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  changeBillItem: React.PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  claimBillItem: React.PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  deleteBillItem: React.PropTypes.func.isRequired,
  interactionType: React.PropTypes.symbol.isRequired,
  newBillItem: React.PropTypes.func.isRequired,
};

export default BillItemList;
