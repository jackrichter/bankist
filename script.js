'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2024-07-05T14:43:26.374Z',
    '2024-07-08T01:49:59.371Z',
    '2024-07-09T01:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2019-07-06T14:43:26.374Z',
    '2020-07-07T18:49:59.371Z',
    '2020-07-09T01:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Date
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();

  // return `${day}/${month}/${year}`;
  return Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// Movements
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // Create current date and time
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    // Format numbers
    const formattedMov = formatCurrency(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
    // console.log(containerMovements.innerHTML);
  });
};

// Balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

// Summary
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(out),
    acc.locate,
    acc.currency
  );

  const interest = acc.movements
    .filter(deposit => deposit > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((interest, i, arr) => {
      // console.log(arr);
      return interest >= 1;
    })
    .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

// Create UserName
const createUserNames = function (accs) {
  // accs = accounts
  accs.forEach(function (acc) {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserNames(accounts);

// Update UI
const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Timer
const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and logout user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    // Decrease time by 1 second
    time--;
  };

  // Set time to 2 minutes
  let time = 120;

  // Call tick right away and then call the timer every one second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

/////////////////////////////////////////////////

// Event handlers //
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// Login
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display Welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    // change opacity to 100
    containerApp.style.opacity = 100;

    // Create current date and time
    const dateNow = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };
    // const locale = navigator.language;
    // console.log(locale);
    labelDate.textContent = Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(dateNow);
    // console.log(intlDate);

    // const dateNow = new Date();
    // const day = `${dateNow.getDate()}`.padStart(2, 0);
    // const month = `${dateNow.getMonth() + 1}`.padStart(2, 0);
    // const year = dateNow.getFullYear();
    // const hour = `${dateNow.getHours()}`.padStart(2, 0);
    // const minute = `${dateNow.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minute}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); // Remove focus

    // Timer: Prior to starting a timer, check if any already exists, and if so, stop it
    if (timer) {
      clearInterval(timer);
    }
    timer = startLogoutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

// Transfer
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );

  // Clean input fields
  inputTransferAmount.value = inputTransferTo.value = '';

  // Transfer conditions to be met
  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAcc?.userName !== currentAccount.userName
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    // console.log(receiverAcc.movements);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

// Loan: The condition for a LOAN: at least one deposit with at least 10% of the loan amount
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loanAmount = Math.floor(inputLoanAmount.value); // Turns to a number automatically

  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov >= loanAmount * 0.1)
  ) {
    setTimeout(function () {
      // Add the loan as a deposit (a movement)
      currentAccount.movements.push(loanAmount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());
      // console.log(account1);

      // Update the UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }

  // Clear input field
  inputLoanAmount.value = '';
});

// Close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.userName &&
    +inputClosePin.value === currentAccount.pin
  ) {
    // FINDINDEX in accounts array for the account to be deleted
    const index = accounts.findIndex(
      acc => acc.userName === currentAccount.userName
    );
    // console.log(index);
    // indexOf(23);

    // Delete account
    accounts.splice(index, 1);

    // Clear input fields
    inputCloseUsername.value = inputClosePin.value = '';

    // Hide UI
    containerApp.style.opacity = 0;
  }
});

// Sort
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// /** Simple Array Methods */
let arr = ['a', 'b', 'c', 'd', 'e'];

// SLICE
// console.log(arr.slice(2)); // ['c', 'd', 'e'] (Obs. Does NOT mutate the original array)
// console.log(arr.slice(2, 4)); // ['c', 'd']
// console.log(arr.slice(-2)); // ['d', 'e']
// console.log(arr.slice(-1)); // ['e']
// console.log(arr.slice(1, -2)); // ['b', 'c']
// console.log(arr.slice()); // ['a', 'b', 'c', 'd', 'e'] (Shallow Copy) <==> Equivalent to:
// console.log([...arr]); // ['a', 'b', 'c', 'd', 'e'] !!!

// SPLICE
// console.log(arr.splice(2)); // ['c', 'd', 'e']
// console.log(arr); // ['a', 'b']
arr.splice(-1); // Removing the last element
// console.log(arr); // ['a', 'b', 'c', 'd'] => OBS!! Splice MUTATES the original array!

arr.splice(1, 2); // Remove two elements starting at pos 1
// console.log(arr); // ['a', 'd']

// REVERSE
arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
// console.log(arr2.reverse()); // ['f', 'g', 'h', 'i', 'j']
// console.log(arr2); // ['f', 'g', 'h', 'i', 'j']  OBS. Mutates the original array

// CONCAT
const letters = arr.concat(arr2);
// console.log(letters); // ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']  OBS. Does NOT Mutate. <==> Equivalent to:
// console.log([...arr, ...arr2]); // ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] No Mutation of the original arrays

// JOIN
// console.log(letters.join(' - ')); // a - b - c - d - e - f - g - h - i - j
// console.log(letters); // ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']   Obs. Does NOT Mutate

/** The AT method */
const arr3 = [23, 11, 64];
// console.log(arr3[0]); // <==>
// console.log(arr3.at(0));

// last element
// console.log(arr3[arr3.length - 1]); // or:
// console.log(arr3.slice(-1)[0]); // or:
// console.log(arr3.at(-1));

// on strings
// console.log('jonas'.at(0));
// console.log('jonas'.at(-1));

/** FOREACH loop (Obs. No break or continue) */
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// for (const movement of movements) {
for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    // console.log(`Movement ${i + 1}, You deposited ${movement}`);
  } else {
    // console.log(`Movement ${i + 1}, You withdrew ${Math.abs(movement)}`);
  }
}

// console.log('-----FOR EACH-----');

movements.forEach((mov, i, arr) => {
  if (mov > 0) {
    // console.log(`Movement ${i + 1}, You deposited ${mov}`);
  } else {
    // console.log(`Movement ${i + 1}, You withdrew ${Math.abs(mov)}`);
  }
});

/** forEach With Maps and Sets */

// MAP
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

currencies.forEach((value, key, map) => {
  // console.log(`${key}: ${value}`);
});

// SET
const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR', 'EUR']);
// console.log(currenciesUnique);
currenciesUnique.forEach((value, _, map) => {
  // console.log(`${value}: ${value}`);
});

///////////////////////////////////////
// Coding Challenge #1

/*
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age,
and stored the data into an array (one array for each).
For now, they are just interested in knowing whether a dog is an adult or a puppy.
A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs!
   So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters).

2. Create an array with both Julia's (corrected) and Kate's data

3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")

4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far 😉

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

GOOD LUCK 😀
*/

const checkDogs = function (dogsJulia, dogsKate) {
  const dogsJuliaCorrected = dogsJulia.slice();
  dogsJuliaCorrected.splice(0, 1);
  dogsJuliaCorrected.splice(-2);

  const allDogs = dogsJuliaCorrected.concat(dogsKate);
  // console.log(allDogs);

  allDogs.forEach((dog, i) => {
    if (dog >= 3) {
      // console.log(`Dog number ${i + 1} is an adult, and is ${dog} years old`);
    } else {
      // console.log(`Dog number ${i + 1} is still a puppy 🐶`);
    }
  });
};

checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
// console.log('   -------------------------------   ');
checkDogs([[9, 16, 6, 8, 3]], [10, 5, 6, 1, 4]);

///////////////////////////////////////

/** Data Transformations: MAP, FILTER, REDUCE */

// The MAP Method
const eurToUSD = 1.1;

const movementsToUSD = movements.map(function (mov) {
  return mov * eurToUSD;
});
// console.log(movements);
// console.log(movementsToUSD);

// Same but using a traditional for-loop
const movementsToUSDfor = [];
for (const mov of movements) {
  movementsToUSDfor.push(mov * eurToUSD);
}
// console.log(movementsToUSDfor);

// Using an arrow function:
const movementsToUSDArrow = movements.map(mov => mov * eurToUSD);
// console.log(movementsToUSDArrow);

const movementsDescriptions = movements.map((mov, i, arr) => {
  if (mov > 0) {
    return `Movement ${i + 1}: You deposited ${mov}`;
  } else {
    return `Movement ${i + 1}: You withdrew ${Math.abs(mov)}`;
  }
});

// Simplified
const movementsDescriptions2 = movements.map(
  (mov, i) =>
    `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
      mov
    )}`
);
// console.log(movementsDescriptions2);

// The FILTER Method
const deposits = movements.filter(mov => mov > 0);
// console.log(deposits);

const depositsFor = [];
for (const mov of movements) {
  if (mov > 0) {
    depositsFor.push(mov);
  }
}
// console.log(depositsFor);

const withdrawals = movements.filter(mov => mov < 0);
// console.log(withdrawals);

// The REDUCE Method
const balance = movements.reduce((acc, mov, i, arr) => {
  // console.log(`Iteration ${i}: acc = ${acc}, movement = ${mov}`);
  return acc + mov;
}, 0);
// console.log(balance);

const balance2 = movements.reduce((acc, cur) => acc + cur, 0);

let balance3 = 0;
for (const mov of movements) {
  balance3 += mov;
}

// Get the movements arrays MAXIMUM value
const max = movements.reduce((acc, mov) => {
  if (acc > mov) return acc;
  else return mov;
}, movements[0]);
// console.log(max);

///////////////////////////////////////
// Coding Challenge #2

/*
Let's go back to Julia and Kate's study about dogs. This time,
they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge.
   If the dog is > 2 years old, humanAge = 16 + dogAge * 4.

2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)

3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)

4. Run the function for both test datasets

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/

const calcAverageHumanAge = function (ages) {
  const humanAges = ages.map(age => (age <= 2 ? 2 * age : 16 + age * 4));
  const adults = humanAges.filter(age => age >= 18);

  // alt. calculation (2,3 = (2+3)/2 or 2/2 + 3/2 = 2.5)
  // const avg = adults.reduce((acc, age, i, arr) => acc + age / arr.length, 0);

  // average = the sum (via reduce) / num of elements
  const average = adults.reduce((acc, cur) => acc + cur, 0) / adults.length;
  // return avg;
  return average;
};

// console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
// console.log(calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]));

/////////////////////////////////////

/** Methods Chaining */

// PIPELINE
const totalDepositsUSD = Math.trunc(
  movements
    .filter((cur, i, arr) => cur > 0)
    .map((cur, i, arr) => {
      // console.log(arr);
      return cur * eurToUSD;
    })
    .reduce((acc, cur, i, arr) => acc + cur, 0)
);
// console.log(totalDepositsUSD);

///////////////////////////////////////
// Coding Challenge #3

/*
Rewrite the 'calcAverageHumanAge' function from the previous challenge, but this time as an arrow function, and using chaining!

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀
*/

const calcAverageHumanAge2 = ages =>
  ages
    .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
    .filter(age => age >= 18)
    .reduce((acc, age, i, arr) => acc + age / arr.length, 0);
// adults.length

const avg1 = calcAverageHumanAge2([5, 2, 4, 1, 15, 8, 3]);
const avg2 = calcAverageHumanAge2([16, 6, 10, 5, 6, 1, 4]);
// console.log(avg1, avg2);

/** The FIND Method */
const firstWithdrawal = movements.find(mov => mov < 0);
// console.log(firstWithdrawal);

const account = accounts.find(acc => acc.owner.includes('Jessica'));
// console.log(account);

/** INCLUDES, SOME, EVERY */
// console.log(movements.includes(-130));
// Equivalent to:
movements.some(mov => mov === -130);

const anyDeposits = movements.some(mov => mov > 0);
// console.log(anyDeposits);

// console.log(account4.movements.every(mov => mov > 0));

// Separate callbacks
const deposit = mov => mov > 0;
// console.log(account1.movements.some(deposit));
// console.log(account2.movements.every(deposit));
// console.log(account3.movements.filter(deposit));

/** FLAT AND FLATMAP (ES2019) */
const nestedArr = [[1, 2, 3], [4, 5, 6], 7, 8];
// console.log(nestedArr.flat());

const deepNestedArr = [[[1, 2], 3], [4, [5, 6]], 7, 8];
// console.log(deepNestedArr.flat(1));
// console.log(deepNestedArr.flat(2));

const accountMovements = accounts.map(acc => acc.movements);
// console.log(accountMovements);
const allMovements = accountMovements.flat();
// console.log(allMovements);

// Using chaining: FLAT
const overallBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance);

// FLATMAP  (map + flat)
const overallBalance2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance2);

/** Sorting Arrays */
const owners = ['Jonas', 'Zack', 'Adam', 'Martha'];
// console.log(owners.sort());
// console.log(owners); // Mutates the Array!!

// Numbers

// Ascending Order
// return < 0: A, B (keep order)
// return > 0: B, A (switch order)
// movements.sort((a, b) => {
//   if (a > b) return 1;
//   if (a < b) return -1;
// });
movements.sort((a, b) => a - b);
// console.log(movements);

// Descending Order
// movements.sort((a, b) => {
//   if (a > b) return -1;
//   if (a < b) return 1;
// });
movements.sort((a, b) => b - a);
// console.log(movements);

/** Other Array methods */
// Array.from
const z = Array.from({ length: 7 }, (_, i) => i + 1);
// console.log(z);

// Obs.
labelBalance.addEventListener('click', function () {
  let movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    element => +element.textContent.replace('£', '')
  );

  // movementsUI = movementsUI.map(element =>
  //   element.textContent.replace('£', ''));

  // Alternative:
  const movementsUI2 = [...document.querySelectorAll('.movements__value')];

  // console.log(movementsUI);
});

///////////////////////////////////////
/* Array Methods Practice **/

// 1. Sum of all deposits
// const bankDepositSum = accounts.map(acc => acc.movements).flat(); // Simplified: map + flat = flatmap!
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((acc, mov) => acc + mov, 0);
// console.log(bankDepositSum);

// 2. How many deposits over 1000€
let numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov >= 1000).length;

// Alt1 using filter + reduce:
numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov >= 1000)
  .reduce((acc, _) => ++acc, 0);

// Alt2 using reduce only (ATTN. MUST USE THE PREFIX ++ OPERATOR!!!):
numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, cur) => (cur >= 1000 ? ++acc : acc), 0);

// console.log(numDeposits1000);

// 3. The sums of all deposits and all withdrawals in an object
const sums = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );

// console.log(sums);

// 4. Convert: this is a nice title -> This Is a Nice Title
const convertTitleCase = function (title) {
  // First character in Upper Case
  const capitalize = str => str[0].toUpperCase() + str.slice(1);

  // words that should not be capitalized
  const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'in', 'with'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitalize(word)))
    .join(' ');

  return capitalize(titleCase);
};

// console.log(convertTitleCase('this is a nice title'));
// console.log(convertTitleCase('this is a LONG title but not too long'));
// console.log(convertTitleCase('and here is another title with an EXAMPLE'));

///////////////////////////////////////
// Coding Challenge #4

/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).

1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. 
   Do NOT create a new array, simply loop over the array. 
   Formula: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)

2. Find Sarah's dog and log to the console whether it's eating too much or too little. 
   HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓

3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') 
   and an array with all owners of dogs who eat too little ('ownersEatTooLittle').

4. Log a string to the console for each array created in 3., like this: 
   "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"

5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)

6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)

7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)

8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order 
   (keep in mind that the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: 
        current > (recommended * 0.90) && current < (recommended * 1.10). 
        Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];

GOOD LUCK 😀
*/

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// 1.
dogs.forEach(dog => (dog.recFood = Math.trunc(dog.weight ** 0.75 * 28)));
// console.log(dogs);

// 2.
const sarahDog = dogs.find(dog => dog.owners.includes('Sarah'));
// console.log(
//   `Sarah's dog is eating too ${
//     sarahDog.curFood > sarahDog.recFood ? 'much' : 'little'
//   }`
// );

// 3.
const ownersEatTooMuch = dogs
  .filter(dog => dog.curFood > dog.recFood)
  .flatMap(dog => dog.owners);
// .map(dog => dog.owners)
// .flat()
// console.log(ownersEatTooMuch);

const ownersEatTooLittle = dogs
  .filter(dog => dog.curFood < dog.recFood)
  .flatMap(dog => dog.owners);
// console.log(ownersEatTooLittle);

// 4.
// "Matilda and Sarah and John's dogs eat too much!"
// "Alice and Bob and Michael's dogs eat too little!"
const str1 = `${ownersEatTooMuch.join(' and ')}'s dogs eat too much!`;
const str2 = `${ownersEatTooLittle.join(' and ')}'s dogs eat too little!`;
// console.log(str1);
// console.log(str2);

// 5.
const rightAmountOfFood = dog => dog.curFood === dog.recFood;
// console.log(dogs.some(rightAmountOfFood));

// 6.
const checkEatingOkay = dog =>
  dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1;
// console.log(dogs.some(checkEatingOkay));

// 7.
const dogsEatingRightArray = dogs.filter(checkEatingOkay);
// console.log(dogsEatingRightArray);

// 8.
const dogsSorted = dogs.slice().sort((a, b) => a.recFood - b.recFood);
// console.log(dogsSorted);

//////////////////////////////////////////////////////////////////////////////

/** NUMBERS */

// Weird in JS
// console.log(0.1 + 0.2);
// console.log(0.1 + 0.2 === 0.3); // false!

// Conversion
// console.log(Number('23'));
// console.log(+'23');

// Paring
// console.log(Number.parseInt('23px', 10));

// console.log(Number.parseFloat('2.5rem')); // 2.5

// Checking if a value is a number
// console.log(Number.isFinite(20)); // true
// console.log(Number.isFinite('20')); // false
// console.log(Number.isFinite(+'20X')); // false
// console.log(Number.isFinite(20 / 0)); // false

// console.log(Number.isInteger(20)); // true
// console.log(Number.isInteger(20.0)); // true
// console.log(Number.isInteger(20 / 0)); // false

// Random
const randomTo6 = Math.trunc(Math.random() * 6) + 1;
// console.log(randomTo6);
const randomFromMinMax = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// console.log(randomFromMinMax(10, 20));

// Rounding integers
// console.log(Math.trunc(23.3)) // 23
// console.log(Math.round(23.3)) // 23
// console.log(Math.round(23.9)) // 24
// console.log(Math.ceil(23.3)) // 24
// console.log(Math.floor(23.3)) // 23
// console.log(Math.floor(-23.3)) // -24

// Rounding decimals
// console.log((2.7).toFixed(0)); // 3 (string)
// console.log((2.7).toFixed(3)); // 2.700 (string)
// console.log((2.345).toFixed(2)); // 2.35 (string)
// console.log(+(2.345).toFixed(2)); // 2.35 (number)

// Reminder
const even = n => n % 2 === 0;

labelBalance.addEventListener('click', () => {
  [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
    if (i % 2 === 0) {
      row.style.backgroundColor = 'orange';
    }
    if (i % 3 === 0) {
      row.style.backgroundColor = 'blue';
    }
  });
});

// Numeric Separator
const diameter = 287_486_000_000;
// console.log(diameter + 1);

// Largest number in JS
// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);

// BigInt (ES2020 - A new primitive)
// console.log(4567720092110901123488899990043421234109997123n);
// console.log(BigInt(45677200321000));

// Operations with BigInt
// console.log(1000000000000988888888888n * 434555555555555555555n); // Can't mix with regular numbers
// console.log(11n / 3n); // 3

/** Date And Time */
const now = new Date();
// console.log(now);
// console.log(new Date('Jul 06 2024 02:12:40'));
// console.log(new Date('December 4 2015'));

// console.log(account1.movementsDates[0]);
// console.log(new Date(2035, 10, 19, 23, 5));
// console.log(new Date(175600235));

// Working with Dates
const future = new Date(2035, 10, 19, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());
// console.log(Date.now());

/** Operations with Dates */
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
const date1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
// console.log(date1);

/** Intl Api */
const nowDate = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};
const locale = navigator.language;
// console.log(locale);
const intlDate = Intl.DateTimeFormat(locale, options).format(nowDate);
// console.log(intlDate);

const num1 = 3888742.23;
const options1 = { style: 'currency', unit: 'celsius', currency: 'USD' };
// console.log('SE:   ', Intl.NumberFormat('sv-SE', options1).format(num1));
// console.log('DK:   ', Intl.NumberFormat('da-DK', options1).format(num1));
// console.log('DE:   ', Intl.NumberFormat('de-DE', options1).format(num1));
// console.log('GB:   ', Intl.NumberFormat('en-GB', options1).format(num1));
// console.log('US:   ', Intl.NumberFormat('en-US', options1).format(num1));
// console.log(
//   'Browser:   ',
//   Intl.NumberFormat(navigator.language, options1).format(num1)
// );

/** Timers */

// setTimeout
const ingredients = ['olives', 'spinach'];
const pizzaTimeout = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  3000,
  ...ingredients
);
// console.log('Waiting...');
if (ingredients.includes('spinach')) {
  clearTimeout(pizzaTimeout);
}

// setInterval
// setInterval(() => {
//   const now = new Date();
//   console.log(now);
// }, 1000);
