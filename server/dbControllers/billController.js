const Bill = require('../db').models.Bill;
const Item = require('../db').models.Item;
const User = require('../db').models.User;
const userController = require('./userController');
const itemController = require('./itemController');

/**
 * Handles interactions with the database to manage Bills.
 * @module Server: Bill Controller
 */

/**
 * Create a bill. The returned promise will resolve to a bill instance
 * that will include the bill's shortId.
 * @param {Object} bill - Properties of the bill.
 * @param {string} bill.payerEmailAddress - Email address of the bill payer.
 * @param {string} [bill.description] - Description of the bill.
 * @param {number} [bill.tax] - Tax in local currency associated with the bill.
 * @param {number} [bill.tip] - Tip amount in local currency
 * @param {Object[]} bill.items - Array of items on the bill.
 * @param {string} bill.items[].description - Description of the item.
 * @param {string} bill.items[].price - Price of the item in local currency.
 *
 * @return {Promise} Resolves to the instance of the Bill from the database.
 */
const createBill = function createBill(bill) {
  return new Promise((resolve, reject) => {
    if (!bill.payerEmailAddress) {
      return reject(new Error('Bill payer email address required'));
    }
    if (!bill.items || bill.items.length === 0) {
      return reject(new Error('At least one bill item is required'));
    }
    return userController.findUserByEmailAddress(bill.payerEmailAddress)
      .then((payerRecord) => {
        console.log('payer record', payerRecord);
        const billWithPayerId = Object.assign({}, bill, { payerId: payerRecord.id });
        console.log('billwpayerid', billWithPayerId);
        return Bill.create(billWithPayerId)
        .then((billRecord) => {
          console.log('billRecord', billRecord);
          // have bill, now create the items
          itemController.createItemsForBill(billRecord.dataValues.id, bill.items)
          .then(() => {
            console.log('before billrecord resolve');
            resolve(billRecord);
          })
          .catch((err) => {
            reject(err);
          });
        })
        .catch((err) => {
          reject(err);
        });
      });
  });
};

/**
 * Retrieve a bill from the database by shortId. The returned promise will resolve to a bill
 * instance that includes the full record of the bill payer, the bill items,
 * and the bill items debtors.
 * @param {string} shortId - ShortId of the bill.
 *
 * @return {Promise} Resolves to the instance of the Bill from the database.
 */
const retrieveBill = function retrieveBill(shortId) {
  return Bill.findOne({
    where: {
      shortId,
    },
    attributes: {
      exclude: ['id'],
    },
    include: [
      {
        model: Item,
        include: [{
          model: User,
          as: 'debtor',
          attributes: {
            exclude: ['password'],
          },
        }],
      },
      {
        model: User,
        as: 'payer',
        attributes: {
          exclude: ['password'],
        },
      },
    ],
  });
};

/**
 * Retrieve all the bills a user is marked as the payer of.
 * @param {string} payerId - The id of the user which corresponds to the payerId of the bills.
 *
 * @return {Promise} Resolves to and array of Bill instances from the database.
 */
const retrievePayerBills = function retrievePayerBills(payerId) {
  return Bill.findAll({
    where: {
      payerId,
    },
    include: [
      {
        model: Item,
        include: [{
          model: User,
          as: 'debtor',
          attributes: {
            exclude: ['password'],
          },
        }],
      }],
  });
};

const retrieveBillWithPaidItems = function retrieveBillWithPaidItems(shortId) {
  return Bill.findOne({
    where: {
      shortId,
    },
    include: {
      model: Item,
      where: {
        paid: true,
      },
      required: false, // left outer join
    },
  });
};

/**
 * Update a bill.
 * @param {string} shortId - Short id of the item to be updated.
 * @param {Object} params - Key-value pairs of the parameters to update.
 * @param {String} [params.description] - Description of the bill.
 * @param {number} [params.tax] - Tax on the bill in local currency.
 * @param {number} [params.tip] - Tip on the bill in local currency.
 * @return {Promise} Resolves to the instance of the Bill from the database.
 */
const updateBill = function updateBill(shortId, params) {
  return Bill.findOne({ where: { shortId } })
    .then(billRecord => billRecord.update(params));
};

/**
 * Delete a bill.
 * @param {string} shortId - Short id of the bill to be deleted.
 * @return {Promise} Resolves to undefined.
 */
const deleteBill = function deleteBill(shortId) {
  return Bill.findOne({ where: { shortId } })
    .then(billInstance => billInstance.destroy());
};

module.exports = {
  createBill,
  retrieveBill,
  retrievePayerBills,
  retrieveBillWithPaidItems,
  updateBill,
  deleteBill,
};
