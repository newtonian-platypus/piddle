import jwtDecode from 'jwt-decode';
import React from 'react';
import { withRouter } from 'react-router';
import { round } from 'mathjs';
import { FormGroup, InputGroup, Form, Well, Button } from 'react-bootstrap';
import ClipboardButton from 'react-clipboard.js';
import './Bill.css';
import BillItemList from './../BillItemList';
import DescriptionField from './../DescriptionField';
import TaxField from './../TaxField';
import TipField from './../TipField';

/**
 * @class Bill
 */
class Bill extends React.Component {
  /**
   * @constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);

    // this.serverUrl = /^(development|test)$/.test(process.env.NODE_ENV) ? 'http://localhost:3000' : '';
    this.serverUrl = process.env.BASE_URL;

    this.stateSetter = this.stateSetter.bind(this);

    // Bill
    this.createBill = this.createBill.bind(this);
    this.updateBill = this.updateBill.bind(this);
    this.claimBillItem = this.claimBillItem.bind(this);
    this.payForClaimedItems = this.payForClaimedItems.bind(this);

    // Bill Item
    this.changeBillItem = this.changeBillItem.bind(this);
    this.newBillItem = this.newBillItem.bind(this);
    this.deleteBillItem = this.deleteBillItem.bind(this);
    this.splitBillItem = this.splitBillItem.bind(this);

    // Tax
    this.changeTaxValue = this.stateSetter('tax');

    // Description
    this.changeDescriptionValue = this.stateSetter('description');

    // Tip
    this.changeTipValue = this.changeTipValue.bind(this);
    this.changeTipPercent = this.changeTipPercent.bind(this);

    // OCR
    this._handleImageChange = this._handleImageChange.bind(this);

    /**
     * @todo Move this into library module?
     */

    this.interactionTypes = {
      new: Symbol.for('new'),
      edit: Symbol.for('edit'),
      claim: Symbol.for('claim')
    };

  }

  /**
   * React lifecycle method called before initial component render().
   * @method
   * @name componentWillMount
   */
  componentWillMount() {
    // Send the user away if they're not already logged in
    // eslint-disable-next-line no-undef
    const token = localStorage.getItem('piddleToken');
    const stateObj = {
      curDebtorDebt: 0,
      description: '',
      inputType: null,
      interactionType: this.interactionTypes.new,
      items: [
        { description: '', price: 0, quantity: 1 },
      ],
      tax: 0,
      tip: {
        value: 0,
        percent: null,
        usePercent: false,
      },
      subtotal: 0,
      total: 0,
      file: null,
      imagePreviewUrl: null
    };

    if (!token) {
      /**
       * @todo where is the proper place to redirect the user away from Bill?
       * This approach is giving a console error in local dev
       */
      stateObj.error = {
        message: 'Error: Not authenticated',
      };
    } else {
      // Set the default state here. We'll load the actual Bill data later
      // in componentDidMount if the user has requested a specific bill to
      // avoid waiting for the API GET request to complete before rendering
      // the Bill.

      stateObj.token = {
        raw: token,
        decoded: jwtDecode(token),
      };
    }

    this.state = stateObj;
  }

  /**
   * React lifecycle method called after initial component render().
   * @method
   * @name componentDidMount
   */
  componentDidMount() {
    const billId = this.props.params.id;

    if (typeof billId !== 'undefined' && this.state.token) {
      /**
       * @todo Extract these variables and functions into a module (DRY).
       */
      // ref: https://github.com/github/fetch
      const checkStatus = (response) => {
        if (response.status >= 200 && response.status < 300) {
          return response;
        }

        const error = new Error(response.statusText);
        error.response = response;
        throw error;
      };

      // eslint-disable-next-line no-undef
      fetch(`${this.serverUrl}/api/bill/${billId}`, {
        method: 'GET',
        headers: {
          Authorization: `JWT ${this.state.token.raw}`,
        },
      })
      .then(checkStatus)
      .then(response => response.json())
      .then(({ data }) => {
        const interactionType =
          (data.payerId === this.state.token.decoded.id) ?
          this.interactionTypes.edit : this.interactionTypes.claim;

        return this.setState({
          ...this.state,
          ...data,
          /**
           * @todo edit/claim based on whether the current user owns the retreived bill
           */
          interactionType,
          tip: {
            value: data.tip,
            percent: null,
            usePercent: false,
          },
        });
      })
      .catch((error) => {
        /**
         * @todo handle this error appropriately
         */
        const userNotAuthorizedToViewBill = (error.response.status === 401);
        if (userNotAuthorizedToViewBill) {
          this.setState({ error });
        }
      });
    }
  }

  enterManually(event) {
    event.preventDefault();

    this.setState({ inputType : 'manual'});
  }

  takePhoto(event) {
    event.preventDefault();

    this.setState({ inputType: 'photo', file: null});
  }

  /**
   * Update the bill.
   * @method
   * @name updateBill
   * @param {object} event
   */
  updateBill(event) {
    event.preventDefault();

    const bill = {
      description: this.state.description,
      items: this.state.items,
      payerEmailAddress: this.state.token.decoded.emailAddress,
      tax: this.state.tax,
      tip: this.state.tip.value,
    };

    /**
     * @todo Extract these variables and functions into a module (DRY).
     */

    const jsonHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `JWT ${this.state.token.raw}`,
    };

    // ref: https://github.com/github/fetch
    const checkStatus = (response) => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }

      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    };

    // eslint-disable-next-line no-undef
    fetch(`${this.serverUrl}/api/bill/${this.props.params.id}`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(bill),
    })
      .then(checkStatus)
      .then(response => response.json())
      .then(({ data }) => {
        console.log('returns data', data);
        /**
         * @todo this changes the URL but doesn't re-render the Bill in edit interactionMode
         */
        this.setState({
          shortId: data.shortId,
          interactionType: this.interactionTypes.edit
        });
        this.props.router.push(`/bill/${data.shortId}`);
      })
      .catch((error) => {
        /**
         * @todo handle this error appropriately
         */
        console.error(error);
      });
  }

  /**
   * Pay for claimed items using a specified payment API.
   * @method
   * @name payForClaimedItems
   * @param {object} event
   */
  payForClaimedItems() {
    // event.preventDefault();

    const itemsToPayFor = this.state.items
      .filter(item => (
        (item.debtorId === this.state.token.decoded.id && !item.paid)
      ));

    const jsonHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `JWT ${this.state.token.raw}`,
    };

    // ref: https://github.com/github/fetch
    const checkStatus = (response) => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }

      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    };

    const updatedItems = this.state.items;
    itemsToPayFor.forEach((itemToPayFor, index) => {
      /**
       * @todo change form name based on type of interaction
       */
      // eslint-disable-next-line no-undef
      const itemIndex = Array.from(document.getElementById('createBillForm').elements)
        .filter(element => (element.tagName === 'INPUT' && element.type === 'checkbox'))
        .reduce((soughtIndex, element, elementIndex) => {
          if (soughtIndex !== null) {
            return soughtIndex;
          } else if (element.value === itemToPayFor.id) {
            return elementIndex;
          }

          return null;
        }, null);

      // eslint-disable-next-line no-undef
      fetch(`${this.serverUrl}/api/item/${itemToPayFor.id}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({
          paid: true,
          debtorId: itemToPayFor.debtorId,
        }),
      })
      .then(checkStatus)
      .then(response => response.json())
      .then(({ data }) => {
        updatedItems[itemIndex] = data;
        const allItemsUpdated = (index === itemsToPayFor.length - 1);
        if (allItemsUpdated) {
          this.setState({ items: updatedItems });
        }
      })
      .catch((err) => {
        /**
         * @todo handle this error appropriately
         */
        console.error(err);
      });
    });
  }

  /**
   * Claim items belonging to this bill.
   * @method
   * @name claimBillItem
   * @param {object} event
   */
  claimBillItem(event) {
    event.preventDefault();

    const jsonHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `JWT ${this.state.token.raw}`,
    };

    // ref: https://github.com/github/fetch
    const checkStatus = (response) => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }

      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    };

    /**
     * @todo change form name based on type of interaction
     */
    // eslint-disable-next-line no-undef
    const itemIndex = Array.from(document.getElementById('createBillForm').elements)
      .filter(element => (element.tagName === 'INPUT' && element.type === 'checkbox'))
      .reduce((soughtIndex, element, index) => {
        if (soughtIndex !== null) {
          return soughtIndex;
        } else if (element.value === event.target.value) {
          return index;
        }

        return null;
      }, null);

    // eslint-disable-next-line no-undef
    fetch(`${this.serverUrl}/api/item/${event.target.value}`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({
        paid: false,
        debtorId: (this.state.items[itemIndex].debtorId) ? null : this.state.token.decoded.id,
      }),
    })
    .then(checkStatus)
    .then(response => response.json())
    .then(({ data }) => {
      const updatedItems = this.state.items;
      updatedItems[itemIndex] = data;

      const sharedBillCosts = (this.state.tax + this.state.tip.value);
      const totalBillPrice = updatedItems
        .reduce((billItemSum, item) => (billItemSum + item.price), 0);
      const curDebtorItemDebt = updatedItems
        .reduce((billItemSum, item) => (
          (item.debtorId === this.state.token.decoded.id) ?
            (billItemSum + item.price) : billItemSum
        ), 0);
      const curDebtorDebtPercent = curDebtorItemDebt / totalBillPrice;
      const curDebtorDebt = curDebtorItemDebt + (curDebtorDebtPercent * sharedBillCosts);

      this.setState({
        curDebtorDebt,
        items: updatedItems,
      });
    })
    .catch((err) => {
      /**
       * @todo handle this error appropriately
       */
      console.error(err);
    });
  }

  /**
   * Create a JSON representation of the current state of the bill
   * @method
   * @name createBill
   * @param {object} event
   */
  createBill(event) {
    event.preventDefault();

    const bill = {
      description: this.state.description,
      items: this.state.items,
      payerEmailAddress: this.state.token.decoded.emailAddress,
      tax: this.state.tax,
      tip: this.state.tip.value,
    };

    /**
     * @todo Extract these variables and functions into a module (DRY).
     */

    const jsonHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `JWT ${this.state.token.raw}`,
    };

    // ref: https://github.com/github/fetch
    const checkStatus = (response) => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }

      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    };

    // eslint-disable-next-line no-undef
    fetch(`${this.serverUrl}/api/bill`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(bill),
    })
      .then(checkStatus)
      .then(response => response.json())
      .then(({ data }) => {
        this.setState({
          shortId: data.shortId,
          interactionType: this.interactionTypes.edit
        });
        this.props.router.push(`/bill/${data.shortId}`);
      })
      .catch((error) => {
        /**
         * @todo handle this error appropriately
         */
        console.error(error);
      });
  }

  /**
   * Delete a specific bill item from the Bill state.
   * @method
   * @name deleteBillItem
   * @param {object} event
   * @param {number} id - The bill item's id.
   */
  deleteBillItem(event, id, itemId) {
    event.preventDefault();
    const previousItems = this.state.items;
    previousItems.splice(id, 1);
    this.setState({ items: previousItems });

    const jsonHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `JWT ${this.state.token.raw}`,
    };

    // ref: https://github.com/github/fetch
    const checkStatus = (response) => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }

      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    };

    fetch(`${this.serverUrl}/api/item/${itemId}`, {
      method: 'DELETE',
      headers: jsonHeaders,
    })
      .then(checkStatus)
      .then(response => response.json())
      .then(() => {
        console.log('item deleted');
      })
      .catch((error) => {
        /**
         * @todo handle this error appropriately
         */
        console.error(error);
      });

    this.updateTip();
    this.calculateSubtotal();
    this.calculateTotal();
  }

  splitBillItem(event, id, itemId) {
    event.preventDefault();
    const previousItems = this.state.items;
    previousItems.splice(id, 1);

    const jsonHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `JWT ${this.state.token.raw}`,
    };

    // ref: https://github.com/github/fetch
    const checkStatus = (response) => {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }

      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    };

    fetch(`${this.serverUrl}/api/item/split/${itemId}`, {
      method: 'POST',
      headers: jsonHeaders,
    })
      .then(checkStatus)
      .then(() => {
        // eslint-disable-next-line no-undef
        const billId = this.props.params.id;
        fetch(`${this.serverUrl}/api/bill/${billId}`, {
          method: 'GET',
          headers: {
            Authorization: `JWT ${this.state.token.raw}`,
          },
        })
        .then(checkStatus)
        .then(response => response.json())
        .then(({ data }) => {
          const interactionType =
            (data.payerId === this.state.token.decoded.id) ?
            this.interactionTypes.edit : this.interactionTypes.claim;

          return this.setState({
            ...this.state,
            ...data,
            /**
             * @todo edit/claim based on whether the current user owns the retreived bill
             */
            interactionType,
            tip: {
              value: data.tip,
              percent: null,
              usePercent: false,
            },
          });
        })
        .catch((error) => {
          /**
           * @todo handle this error appropriately
           */
          const userNotAuthorizedToViewBill = (error.response.status === 401);
          if (userNotAuthorizedToViewBill) {
            this.setState({ error });
          }
        });
      })
      .catch((error) => {
        /**
         * @todo handle this error appropriately
         */
        console.error(error);
      });
  }

  /**
   * Adds a new, empty, bill item to the Bill state.
   * @method
   * @name newBillItem
   * @param {object} event
   */
  newBillItem(event) {
    event.preventDefault();
    const newItem = {
      description: '',
      price: 0,
      quantity: 1
    };

    this.setState({ items: [...this.state.items, newItem] });
  }

  /**
   * Build a setter for a given state key.
   * @method
   * @name stateSetter
   * @param {string} key - Key to state to be modified.
   * @returns {function} Setter function for provided key.
   */
  stateSetter(key) {
    return newState => this.setState({ [key]: newState });
  }

  /**
   * Update Bill state with new tip value.
   * @method
   * @name changeTipValue
   * @param {number} tip
   */
  changeTipValue(tip) {
    const tipState = this.state.tip;
    tipState.value = tip;
    tipState.usePercent = false;
    this.setState({ tip: tipState });
  }

  /**
   * Update bill state with new tip percent and configure tip to keep itself
   * updated as bill item prices change.
   * @method
   * @name changeTipPercent
   * @param {number} percent
   */
  changeTipPercent(percent) {
    const tipState = this.state.tip;
    tipState.percent = percent;
    tipState.usePercent = true;
    this.setState({ tip: tipState });

    this.updateTip();
  }

  /**
   * Update tip in bill state based  on current tip percent.
   * @method
   * @name updateTip
   */
  updateTip() {
    const tipState = this.state.tip;
    tipState.value = this.calculateTip();
    this.setState({ tip: tipState });

    this.calculateSubtotal();
    this.calculateTotal();
  }

  /**
   * Calculate the tip based on current tip percent. Returns the current tip
   * if the tip isn't being calculated based on a percentage of the bill's
   * total cost.
   * @method
   * @name calculateTip
   * @returns {number}
   */
  calculateTip() {
    // Only update the state if the user has instructed us to calculate the
    // tip based on a given percent.
    let tip = this.state.tip.value;
    if (this.state.tip.usePercent) {
      const total = this.state.items.reduce((sum, billItem) => (
        sum + billItem.price
      ), 0);
      tip = total * (this.state.tip.percent / 100);
    }
    return tip;
  }

  calculateSubtotal() {
    let subtotal = 0;
    let items = this.state.items;
    for (var i = 0; i < items.length; i++) {
      subtotal += items[i].price;
    }
    this.setState({subtotal: subtotal});
    return subtotal;
  }

  calculateTotal() {
    let total = 0;
    let subtotal = this.calculateSubtotal();
    let tax = this.state.tax;
    let tip = this.state.tip.value;
    total = subtotal + tax + tip;

    this.setState({total: total})
    return total;
  }

  /**
   * Update state with new bill item field values.
   * @method
   * @name changeBillItem
   * @param {object} fields
   * @param {string} [fields.description] - Bill item description
   * @param {number} [fields.price] - Bill item price
   */
  changeBillItem(index, fields) {
    // Update the bill state
    const billItem = { ...this.state.items[index], ...fields };
    const previousItems = this.state.items;
    previousItems[index] = billItem;
    this.setState({ items: previousItems });

    this.updateTip();
    this.calculateTotal();
  }

  _handleImageChange(e) {
    e.preventDefault();
    this.setState({tax: 0});

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
      // console.log(this.state.imagePreviewUrl);
      // console.log('file', file);

      fetch(`${this.serverUrl}/api/image`, {
        headers: {
          'Accept': 'application/text'
        },
        method: 'POST',
        body: this.state.file
      }).then(result => result.json())
      .then(data => {
        this.setState({items: data.items,
                       inputType: null,
                       tax: data.tax,
                       imagePreviewUrl: null
                      });

        this.setState({total: this.calculateTotal(),
                       subtotal: this.calculateSubtotal()
                      });
      })
      .catch(err => console.log(err));
    }
    reader.readAsDataURL(file)
  }

  /**
   * Render the component
   * @method
   * @name render
   * @returns {object}
   */
  render() {
    return (
      <div className="Bill">
        {this.state.error &&
          <p>{this.state.error.message}</p>
        }
        {!this.state.error &&
          <div>
            {
              /**
               * @todo Make into a component
               */
            }
            {(this.state.interactionType === Symbol.for('new')) &&
              <p className="Bill-intro lead">
                Create a new Bill!
              </p>
            }
            {(this.state.interactionType === Symbol.for('edit')) &&
              <p className="Bill-intro lead">
                Edit the bill!
              </p>
            }
            {(this.state.interactionType === Symbol.for('claim')) &&
              <p className="Bill-intro lead">
                Claim the items that belong to you!
              </p>
            }

            {(this.state.interactionType === Symbol.for('new')) &&
              <div className="text-center">
                <Button
                  className="btn-primary"
                  id="take-photo-btn"
                  bsSize="lg"
                  type="submit"
                  value="Take Photo"
                  onClick={this.takePhoto.bind(this)}
                >Take Photo
                </Button>

                <Button
                  className="btn-primary"
                  id="manual-btn"
                  bsSize="lg"
                  type="submit"
                  value="Manual"
                  onClick={this.enterManually.bind(this)}
                >Manual
                </Button>
              </div>
            }


            {(this.state.inputType === 'manual') &&
              <p className="Enter-items-below text-center">
                Enter your items in the form below.
              </p>
            }


            {(this.state.inputType === 'photo') &&
              <div className="uploadBill">
                <input type="file" accept="image/*" capture="camera" name="userPhoto" onChange={this._handleImageChange} />
                <div>
                  {this.state.imagePreviewUrl ? <img src={this.state.imagePreviewUrl} alt="uploaded receipt"/> : null}
                </div>
              </div>
            }
            <Form
              inline
              id="createBillForm"
              ref={(c) => { this.createBillForm = c; }}
            >
              <Well bsSize="lg">
                <DescriptionField
                  changeDescriptionValue={this.changeDescriptionValue}
                  descriptionValue={this.state.description}
                  interactionType={this.state.interactionType}
                />
                <BillItemList
                  items={this.state.items}
                  deleteBillItem={this.deleteBillItem}
                  splitBillItem={this.splitBillItem}
                  claimBillItem={this.claimBillItem}
                  changeBillItem={this.changeBillItem}
                  interactionType={this.state.interactionType}
                  newBillItem={this.newBillItem}
                />
              </Well>

              {(this.state.interactionType === Symbol.for('new')) ||
                (this.state.interactionType === Symbol.for('edit'))
                ? <p>The subtotal is: ${this.state.subtotal}</p>
                : null
              }

              <TaxField
                changeTaxValue={this.changeTaxValue}
                interactionType={this.state.interactionType}
                taxValue={this.state.tax}
              />
              <TipField
                changeTipValue={this.changeTipValue}
                changeTipPercent={this.changeTipPercent}
                interactionType={this.state.interactionType}
                tipValue={this.state.tip.value}
              />
              {
                /**
                 * @todo Make into a component
                 */
              }

              {(this.state.interactionType === Symbol.for('new')) ||
                (this.state.interactionType === Symbol.for('edit'))
                ? <p>The total is: ${this.state.total}</p>
                : null
              }

              {(this.state.interactionType === Symbol.for('new')) &&
                <div className="text-center">
                  <Button
                    className="btn-primary"
                    id="create-new-bill-btn"
                    bsSize="lg"
                    type="submit"
                    value="Create New Bill"
                    onClick={this.createBill}
                  >Create New Bill
                  </Button>
                </div>
              }

              {(this.state.shortId) &&
                <div>
                  <br />
                  <h5>Copy this link to send to your friends</h5>
                  <FormGroup>
                    <InputGroup>
                      <InputGroup.Addon>Link:</InputGroup.Addon>
                      <InputGroup.Addon>{`http://localhost:3001/bill/${this.state.shortId}`}</InputGroup.Addon>
                      <InputGroup.Button>
                        <ClipboardButton
                          className="btn btn-primary shortLink"
                          data-clipboard-text={`http://localhost:3001/bill/${this.state.shortId}`}
                        >
                          <span className="glyphicon glyphicon-copy"></span>
                        </ClipboardButton>
                      </InputGroup.Button>
                    </InputGroup>
                  </FormGroup>
                </div>
              }

              {(this.state.interactionType === Symbol.for('edit')) &&
                <Button
                  className="btn-primary"
                  id="create-new-bill-btn"
                  bsSize="lg"
                  type="submit"
                  value="Save Changes"
                  onClick={this.updateBill}
                >Save Changes
                </Button>
              }
              {(this.state.interactionType === Symbol.for('claim')) &&
                <div>
                  <br />
                  <a
                    className="btn btn-primary"
                    href={`https://cash.me/${this.state.payer.squareId}/${round(this.state.curDebtorDebt, 2)}`}
                    onClick={this.payForClaimedItems}
                  >
                    Pay via Square Cash
                  </a>
                  <a
                    className="btn btn-primary"
                    href={`https://paypal.me/${this.state.payer.paypalId}/${round(this.state.curDebtorDebt, 2)}`}
                    onClick={this.payForClaimedItems}
                  >
                    Pay via Paypal
                  </a>
                </div>
              }
            </Form>
          </div>
        }
      </div>
    );
  }
}

Bill.propTypes = {
  router: React.PropTypes.shape({
    push: React.PropTypes.func.isRequired,
  }),
  params: React.PropTypes.shape({
    id: React.PropTypes.string,
  }),
};

export default withRouter(Bill);


