const config = require('../config.js');
const Sequelize = require('sequelize');
const Hashids = require('hashids');
const bcrypt = require('bcrypt-as-promised');

const hashIds = new Hashids('manatee salt', 5);

console.log('db path:', config.db.path);

const sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
  host: 'localhost',
  dialect: 'sqlite',
  logging: (process.env.NODE_ENV === 'test') ? false : console.log, // eslint-disable-line
  storage: config.db.path,
});

const Bill = sequelize.define('bill', {
  shortId: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
  },
  tax: {
    type: Sequelize.DECIMAL(10, 2), // eslint-disable-line
  },
  tip: {
    type: Sequelize.DECIMAL(10, 2), // eslint-disable-line
  },
},
  {
    hooks: {
      afterCreate: bill => bill.update({ shortId: hashIds.encode(bill.dataValues.id) }),
    },
  }
);

const Item = sequelize.define('item', {
  description: {
    type: Sequelize.STRING,
  },
  price: {
    type: Sequelize.DECIMAL(10, 2),  // eslint-disable-line
    allowNull: false,
  },
  paid: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  // claimed: {
  //   type: Sequelize.BOOLEAN,
  //   defaultValue: false,
  // },
});

const User = sequelize.define('user', {
  emailAddress: {
    type: Sequelize.STRING,
    allowNull: false,
    isEmail: true,
    unique: true,
    isLowercase: true
  },
  password: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  squareId: {
    type: Sequelize.STRING,
    is: /$\$\S+/, // begins with dollar sign
  },
  paypalId: {
    type: Sequelize.STRING,
  },
},
  {
    instanceMethods: {
      setPassword: function setPassword(password) {
        return bcrypt.hash(password, config.bcryptHashRounds)
          .then(hash => this.update({ password: hash }));
      },
      comparePassword: function comparePassword(attempt) {
        return new Promise((resolve, reject) => {
          bcrypt.compare(attempt, this.password)
            .then(() => resolve(true))
            .catch(bcrypt.MISMATCH_ERROR, () => resolve(false))
            .catch(err => reject(err));
        });
      },
    },
  }
);


/*
Currently, we assign debtors to bills through items.
So, a bill has items, and each item may or may not
have a debtor associated with it.

In the future, it may be useful to associate debtors with
bills without assigning them to a specific item. The user story would
be, the payer generates the bill, then lists his friends as debtors,
without assigning them items. The debtors would then get notified somehow.

This many-to-many relationship can be set up through the BillDebtors join
table:

const BillDebtors = sequelize.define('bill_debtors', {
});

User.belongsToMany(Bill, {
  through: BillDebtors,
  as: 'Debtors',
  foreignKey: 'debtorId',
});

Bill.belongsToMany(User, { through: BillDebtors });
*/

Bill.belongsTo(User, {
  as: 'payer',
  foreignKey: 'payerId',
});

// Items
Bill.hasMany(Item);

Item.belongsTo(Bill);

Item.belongsTo(User, {
  as: 'debtor',
  foreignKey: 'debtorId',
});


// Create the tables specified above
User.sync();
Bill.sync();
Item.sync();

module.exports = {
  models: {
    Bill,
    Item,
    User,
  },
  sequelize,
};
