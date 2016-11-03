const expect = require('chai').expect;
const app = require('../server');
const db = require('../db');
const request = require('supertest');
const userController = require('../dbControllers/userController');
const billController = require('../dbControllers/billController');
const itemController = require('../dbControllers/itemController');
const specHelpers = require('./specHelpers');
const config = require('../../config');
/* eslint-disable no-unused-expressions */

if (/test/.test(config.db.path) === false) {
  throw new Error('NODE_ENV not set to \'test\'.');
}

const sampleBill = {
  sampleData: {
    description: 'Tu Lan lunch',
    tax: 2.46,
    tip: 9.50,
    payerEmailAddress: 'sample@gmail.com',
    items: [
      { description: 'Dragon Roll', price: 10.99 },
      { description: 'Curry Rice', price: 6.50 },
      { description: 'Soda', price: 2.99 },
      { description: 'Cake', price: 4.00 },
      { description: 'Pie', price: 4.99 },
    ],
  },
};

const sampleBill2 = {
  sampleData: {
    description: 'Chipogo',
    tax: 1.99,
    tip: 1,
    payerEmailAddress: 'sample@gmail.com',
    items: [
      { description: 'Burrito', price: 7.99 },
      { description: 'Veggie Bowl', price: 6.50 },
      { description: 'Chips and Guac', price: 3.79 },
    ],
  },
};

const sampleBill3 = {
  sampleData: {
    description: 'Super Burger Dinner',
    tax: 2.99,
    tip: null,
    payerEmailAddress: 'otheruser@gmail.com',
    items: [
      { description: 'Big Burger', price: 5.99 },
      { description: 'Seasoned fries', price: 3.50 },
      { description: 'Chicken nuggerts', price: 4.79 },
    ],
  },
};

const sampleUser = {
  sampleData: {
    emailAddress: 'sample@gmail.com',
    password: 'password1234',
    name: 'Elsabeth Theudobald',
  },
};

const sampleDebtor = {
  sampleData: {
    emailAddress: 'debtor@gmail.com',
    password: 'password456',
    name: 'Hambone',
  },
};

const otherUser = {
  sampleData: {
    emailAddress: 'otheruser@gmail.com',
    password: '1qaz2wsx3edc',
    name: 'Joel Moore',
  },
};

describe('API Interactions', () => {
  describe('Bills', () => {
    describe('Creating a bill', () => {
      // run createSampleBill to populate 'bill' with sample data, then
      // destroy the record
      before(done => specHelpers.emptyRecords(done));
      before(done => specHelpers.createSampleUser(sampleUser, done));
      beforeEach(done => specHelpers.createSampleBill(sampleBill, done));
      before(done => specHelpers.setSampleUserToken(sampleUser, done));
      beforeEach((done) => {
        db.models.Bill.sync({ force: true });
        done();
      });

      it('should respond with a 201 code', (done) => {
        request(app)
          .post('/api/bill')
          .set('authorization', `JWT ${sampleUser.generatedData.token}`)
          .send(sampleBill.sampleData)
          .expect(201, done);
      });

      it('should respond with the bill shortId', (done) => {
        request(app)
          .post('/api/bill')
          .set('authorization', `JWT ${sampleUser.generatedData.token}`)
          .send(sampleBill.sampleData)
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.body.data.shortId).to.be.a('String');
            expect(response.body.data.id).to.match(/\w+/);
            done();
          });
      });

      it('should respond with an error for malformed bills', (done) => {
        delete sampleBill.sampleData.payerEmailAddress;
        request(app)
          .post('/api/bill')
          .set('authorization', `JWT ${sampleUser.generatedData.token}`)
          .send(sampleBill.sampleData)
          .end((err, response) => {
            expect(response.body.error).to.be.an('Object');
            expect(response.status).to.equal(400);
            expect(response.body.error.message).to.be.a('String');
            sampleBill.sampleData.payerEmailAddress = 'sample@gmail.com';
            done();
          });
      });

      it('should not allow creation from users who do not send auth token', (done) => {
        request(app)
          .post('/api/bill')
          .send(sampleBill.sampleData)
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(401);
            done();
          });
      });
    });

    describe('Retrieving a bill', () => {
      sampleBill.sampleData.payerEmailAddress = 'sample@gmail.com'; // put back
      before(done => specHelpers.emptyRecords(done));
      before(done => specHelpers.createSampleUser(sampleUser, done));
      before(done => specHelpers.setSampleUserToken(sampleUser, done));
      before(done => specHelpers.createSampleBill(sampleBill, done));

      it('should retrieve bills', (done) => {
        request(app)
          .get(`/api/bill/${sampleBill.generatedData.shortId}`)
          .set('authorization', `JWT ${sampleUser.generatedData.token}`)
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(200);
            const billResponse = response.body.data;
            expect(billResponse).to.exist;
            expect(billResponse.description).to.equal(sampleBill.sampleData.description);
            expect(billResponse.items.length).to.equal(sampleBill.sampleData.items.length);
            done();
          });
      });

      it('should not retrieve bills unless the user sends auth token', (done) => {
        request(app)
        .get(`/api/bill/${sampleBill.generatedData.shortId}`)
        .end((err, response) => {
          expect(response.status).to.equal(401);
          done();
        });
      });

      it('should respond with an error if the bill does not exist', (done) => {
        request(app)
          .get('/api/bill/badId1')
          .set('authorization', `JWT ${sampleUser.generatedData.token}`)
          .end((err, response) => {
            expect(response.status).to.equal(400);
            expect(response.body.error).to.exist;
            expect(response.body.error.message).to.match(/not found/gi);
            done();
          });
      });
    });

    describe('Retrieving bills of users', () => {
      before(done => specHelpers.emptyRecords(done));
      before(done => specHelpers.createSampleUser(sampleUser, done));
      before(done => specHelpers.createSampleUser(sampleDebtor, done));
      before(done => specHelpers.createSampleUser(otherUser, done));
      before(done => specHelpers.setSampleUserToken(sampleUser, done));
      before(done => specHelpers.createSampleBill(sampleBill, done));
      before(done => specHelpers.createSampleBill(sampleBill2, done));
      before(done => specHelpers.createSampleBill(sampleBill3, done));

      it('should require authentication', (done) => {
        request(app)
          .get('/api/bills')
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(401);
            done();
          });
      });

      it('should respond with the authenticated user\'s bills', (done) => {
        request(app)
          .get('/api/bills')
          .set('authorization', `JWT ${sampleUser.generatedData.token}`)
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(200);
            expect(response.body.error).to.not.exist;
            expect(response.body.data).to.be.an('Array');
            expect(response.body.data[0].payerId).to.equal(sampleUser.generatedData.id);
            expect(response.body.data[1].description).to.equal(sampleBill2.sampleData.description);
            done();
          });
      });
    });

    describe('Updating bills', () => {
      before(done => specHelpers.emptyRecords(done));
      before(done => specHelpers.createSampleUser(sampleUser, done));
      before(done => specHelpers.createSampleUser(otherUser, done));
      before(done => specHelpers.setSampleUserToken(sampleUser, done));
      before(done => specHelpers.setSampleUserToken(otherUser, done));
      before(done => specHelpers.createSampleBill(sampleBill, done));

      it('should not be able to update bills unless authenticated', (done) => {
        request(app)
          .put(`/api/bill/${sampleBill.generatedData.shortId}`)
          .send({
            description: 'New Description',
          })
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(401);
            done();
          });
      });

      it('should not be able to update a bill unless the user is the payer', (done) => {
        request(app)
          .put(`/api/bill/${sampleBill.generatedData.shortId}`)
          .set('authorization', `JWT ${otherUser.generatedData.token}`) // otherUser is NOT bill owner
          .send({
            description: 'New Description',
          })
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(403);
            done();
          });
      });

      it('should be able to update the bill', (done) => {
        request(app)
          .put(`/api/bill/${sampleBill.generatedData.shortId}`)
          .set('authorization', `JWT ${sampleUser.generatedData.token}`) // sampleUser is bill owner
          .send({
            description: 'New Description',
            tax: 3.33,
            tip: 7.54,
          })
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(200);
            expect(response.body.data.description).to.equal('New Description');
            expect(response.body.data.tax).to.equal(3.33);
            expect(response.body.data.tip).to.equal(7.54);
            done();
          });
      });

      it('should not be able to update tax or tip once an item has been marked paid', (done) => {
        const itemIds = [];

        billController.retrieveBill(sampleBill.generatedData.shortId)
          .then((billInstance) => {
            billInstance.get('items').forEach((itemRecord) => {
              itemIds.push(itemRecord.get('id'));
            });
            itemController.updateItem(itemIds[1], { paid: true })
              .then(() => {
                request(app)
                  .put(`/api/bill/${sampleBill.generatedData.shortId}`)
                  .set('authorization', `JWT ${sampleUser.generatedData.token}`) // sampleUser is bill owner
                  .send({
                    tax: 3.33,
                    tip: 7.54,
                  })
                  .end((err, response) => {
                    expect(err).to.not.exist;
                    expect(response.status).to.equal(400);
                    done();
                  });
              });
          });
      });
    });

    describe('Deleting bills', () => {
      before(done => specHelpers.emptyRecords(done));
      before(done => specHelpers.createSampleUser(sampleUser, done));
      before(done => specHelpers.createSampleUser(otherUser, done));
      before(done => specHelpers.setSampleUserToken(sampleUser, done));
      before(done => specHelpers.setSampleUserToken(otherUser, done));
      before(done => specHelpers.createSampleBill(sampleBill, done));

      it('should not be able to delete a bill unless the user is the payer', (done) => {
        request(app)
          .delete(`/api/bill/${sampleBill.generatedData.shortId}`)
          .set('authorization', `JWT ${otherUser.generatedData.token}`) // otherUser is NOT bill owner
          .send()
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(401);
            done();
          });
      });

      it('should be able to delete the bill', (done) => {
        request(app)
          .delete(`/api/bill/${sampleBill.generatedData.shortId}`)
          .set('authorization', `JWT ${sampleUser.generatedData.token}`) // sampleUser is bill owner
          .send()
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(200);
            done();
          });
      });
    });
  });

  describe('Items', () => {
    describe('Updating items', () => {
      before(done => specHelpers.emptyRecords(done));
      before(done => specHelpers.createSampleUser(sampleUser, done));
      before(done => specHelpers.setSampleUserToken(sampleUser, done));
      before(done => specHelpers.createSampleUser(sampleDebtor, done));
      before(done => specHelpers.setSampleUserToken(sampleDebtor, done));
      before(done => specHelpers.createSampleBill(sampleBill, done));
      const itemIds = [];
      before((done) => {
        billController.retrieveBill(sampleBill.generatedData.shortId)
          .then((billInstance) => {
            billInstance.get('items').forEach((itemRecord) => {
              itemIds.push(itemRecord.get('id'));
            });
            done();
          });
      });

      it('should not be able to update items unless authenticated', (done) => {
        request(app)
          .put(`/api/item/${itemIds[0]}`)
          .send({
            price: 69.96,
          })
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(401);
            done();
          });
      });

      it('should be able to update all parameters as bill owner', (done) => {
        request(app)
          .put(`/api/item/${itemIds[0]}`)
          .set('authorization', `JWT ${sampleUser.generatedData.token}`) // sampleUser is bill owner
          .send({
            price: 69.96,
          })
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(200);
            expect(response.body.data.price).to.equal(69.96);
            done();
          });
      });

      it('should not be able to update all parameters as non-bill owner', (done) => {
        request(app)
          .put(`/api/item/${itemIds[0]}`)
          .set('authorization', `JWT ${sampleDebtor.generatedData.token}`)
          .send({
            price: 22.96,
          })
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(403);
            done();
          });
      });

      it('should be able to claim items as a non-bill owner', (done) => {
        request(app)
          .put(`/api/item/${itemIds[0]}`)
          .set('authorization', `JWT ${sampleDebtor.generatedData.token}`)
          .send({
            debtorId: sampleDebtor.generatedData.id,
          })
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(200);
            expect(response.body.data.debtorId).to.equal(sampleDebtor.generatedData.id);
            expect(response.body.data.debtor.name).to.equal(sampleDebtor.sampleData.name);
            done();
          });
      });

      it('should not be able to set the debtor as someone else as non-bill owner', (done) => {
        request(app)
          .put(`/api/item/${itemIds[1]}`)
          .set('authorization', `JWT ${sampleDebtor.generatedData.token}`)
          .send({
            debtorId: sampleDebtor.generatedData.id + 6, // not the debtor's id
          })
          .end((err, response) => {
            expect(err).to.not.exist;
            expect(response.status).to.equal(403);
            done();
          });
      });

      it('should be able to "unclaim" an item it is marked as the debtor on', (done) => {
        db.models.Item.findById(itemIds[2])
          .then(itemRecord => itemRecord.update({ debtorId: sampleDebtor.generatedData.id }))
          .then(() => {
            request(app)
              .put(`/api/item/${itemIds[2]}`)
              .set('authorization', `JWT ${sampleDebtor.generatedData.token}`)
              .send({
                debtorId: null,
              })
              .end((err, response) => {
                expect(err).to.not.exist;
                expect(response.status).to.equal(200);
                expect(response.body.data.debtorId).to.equal(null);
                done();
              });
          });
      });

      it('should not be able to claim an item that is already claimed by someone else', (done) => {
        db.models.Item.findById(itemIds[3])
          // item claimed by payer
          .then(itemRecord => itemRecord.update({ debtorId: sampleUser.generatedData.id }))
          .then(() => {
            request(app)
              .put(`/api/item/${itemIds[3]}`)
              .set('authorization', `JWT ${sampleDebtor.generatedData.token}`)
              .send({
                debtorId: sampleDebtor.generatedData.id,
              })
              .end((err, response) => {
                expect(err).to.not.exist;
                expect(response.status).to.equal(403);
                done();
              });
          });
      });

      it('should not be able to change an item marked paid, except to mark it unpaid', (done) => {
        db.models.Item.findById(itemIds[4])
          .then(itemRecord => itemRecord.update({
            debtorId: sampleDebtor.generatedData.id,
            paid: true,
          }))
          .then(() => {
            request(app)
              .put(`/api/item/${itemIds[4]}`)
              .set('authorization', `JWT ${sampleUser.generatedData.token}`)
              .send({
                description: 'New description',
              })
              .end((err, response) => {
                expect(err).to.not.exist;
                expect(response.status).to.equal(403);
                done();
              });
          });
      });
    });
  });

  describe('Updating users', () => {
    before(done => specHelpers.emptyRecords(done));
    before(done => specHelpers.createSampleUser(sampleUser, done));
    before(done => specHelpers.setSampleUserToken(sampleUser, done));

    it('should update a user', (done) => {
      request(app)
        .put(`/auth/user/${sampleUser.generatedData.id}`)
        .set('authorization', `JWT ${sampleUser.generatedData.token}`)
        .send({
          paypalId: 'newPPId',
        })
        .end((err, response) => {
          expect(err).to.not.exist;
          expect(response.status).to.equal(200);
          expect(response.body.data.token).to.exist;
          userController.findUserById(sampleUser.generatedData.id)
            .then((userInstance) => {
              expect(userInstance.get('paypalId')).to.equal('newPPId');
              done();
            });
        });
    });

    it('should not be able to update a different user than the authorized user',
      (done) => {
        request(app)
         .put(`/auth/user/${sampleUser.generatedData.id + 1}`) // not the logged in user
         .set('authorization', `JWT ${sampleUser.generatedData.token}`)
         .send({
           paypalId: 'newPPId',
         })
         .end((err, response) => {
           expect(err).to.not.exist;
           expect(response.status).to.equal(403);
           expect(response.error).to.exist;
           done();
         });
      });
    });
});

