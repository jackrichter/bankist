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
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

// Movements
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov}£</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);

    // console.log(containerMovements.innerHTML);
  });
};

// Balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = `${acc.balance}€`;
};

// Summary
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(deposit => deposit > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((interest, i, arr) => {
      // console.log(arr);
      return interest >= 1;
    })
    .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = `${interest}€`;
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
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

/////////////////////////////////////////////////

// Event handlers //

// Login
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display Welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    // change opacity to 100
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); // Remove focus

    // Update UI
    updateUI(currentAccount);
  }
});

// Transfer
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
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

    // Update UI
    updateUI(currentAccount);
  }
});

// The condition for a LOAN: at least one deposit with at least 10% of the loan amount
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loanAmount = Number(inputLoanAmount.value);

  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov >= loanAmount * 0.1)
  ) {
    // Add the loan as a deposit (a movement)
    currentAccount.movements.push(loanAmount);

    // Update the UI
    updateUI(currentAccount);
  }

  // Clear input field
  inputLoanAmount.value = '';
});

// Close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.userName &&
    Number(inputClosePin.value) === currentAccount.pin
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
// let arr = ['a', 'b', 'c', 'd', 'e'];

// // SLICE
// console.log(arr.slice(2)); // ['c', 'd', 'e'] (Obs. Does NOT mutate the original array)
// console.log(arr.slice(2, 4)); // ['c', 'd']
// console.log(arr.slice(-2)); // ['d', 'e']
// console.log(arr.slice(-1)); // ['e']
// console.log(arr.slice(1, -2)); // ['b', 'c']
// console.log(arr.slice()); // ['a', 'b', 'c', 'd', 'e'] (Shallow Copy) <==> Equivalent to:
// console.log([...arr]); // ['a', 'b', 'c', 'd', 'e'] !!!

// // SPLICE
// // console.log(arr.splice(2)); // ['c', 'd', 'e']
// // console.log(arr); // ['a', 'b']
// arr.splice(-1); // Removing the last element
// console.log(arr); // ['a', 'b', 'c', 'd'] => OBS!! Splice MUTATES the original array!

// arr.splice(1, 2); // Remove two elements starting at pos 1
// console.log(arr); // ['a', 'd']

// // REVERSE
// arr = ['a', 'b', 'c', 'd', 'e'];
// const arr2 = ['j', 'i', 'h', 'g', 'f'];
// console.log(arr2.reverse()); // ['f', 'g', 'h', 'i', 'j']
// console.log(arr2); // ['f', 'g', 'h', 'i', 'j']  OBS. Mutates the original array

// // CONCAT
// const letters = arr.concat(arr2);
// console.log(letters); // ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']  OBS. Does NOT Mutate. <==> Equivalent to:
// console.log([...arr, ...arr2]); // ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] No Mutation of the original arrays

// // JOIN
// console.log(letters.join(' - ')); // a - b - c - d - e - f - g - h - i - j
// console.log(letters); // ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']   Obs. Does NOT Mutate

// /** The at method */
// const arr3 = [23, 11, 64];
// console.log(arr3[0]); // <==>
// console.log(arr3.at(0));

// // last element
// console.log(arr3[arr3.length - 1]); // or:
// console.log(arr3.slice(-1)[0]); // or:
// console.log(arr3.at(-1));

// // on strings
// console.log('jonas'.at(0));
// console.log('jonas'.at(-1));

// /** for-each loop (Obs. No break or continue) */
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// // for (const movement of movements) {
// for (const [i, movement] of movements.entries()) {
//   if (movement > 0) {
//     console.log(`Movement ${i + 1}, You deposited ${movement}`);
//   } else {
//     console.log(`Movement ${i + 1}, You withdrew ${Math.abs(movement)}`);
//   }
// }

// console.log('-----FOR EACH-----');

// movements.forEach((mov, i, arr) => {
//   if (mov > 0) {
//     console.log(`Movement ${i + 1}, You deposited ${mov}`);
//   } else {
//     console.log(`Movement ${i + 1}, You withdrew ${Math.abs(mov)}`);
//   }
// });

// /** forEach With Maps and Sets */
// // MAP
// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// currencies.forEach((value, key, map) => {
//   console.log(`${key}: ${value}`);
// });

// // SET
// const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR', 'EUR']);
// console.log(currenciesUnique);
// currenciesUnique.forEach((value, _, map) => {
//   console.log(`${value}: ${value}`);
// });

// ///////////////////////////////////////
// // Coding Challenge #1

// /*
// Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age,
// and stored the data into an array (one array for each).
// For now, they are just interested in knowing whether a dog is an adult or a puppy.
// A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

// Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

// 1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs!
//    So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters).
// 2. Create an array with both Julia's (corrected) and Kate's data
// 3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
// 4. Run the function for both test datasets

// HINT: Use tools from all lectures in this section so far 😉

// TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
// TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

// GOOD LUCK 😀
// */

// const checkDogs = function (dogsJulia, dogsKate) {
//   const dogsJuliaCorrected = dogsJulia.slice();
//   dogsJuliaCorrected.splice(0, 1);
//   dogsJuliaCorrected.splice(-2);

//   const allDogs = dogsJuliaCorrected.concat(dogsKate);
//   // console.log(allDogs);

//   allDogs.forEach((dog, i) => {
//     if (dog >= 3) {
//       console.log(`Dog number ${i + 1} is an adult, and is ${dog} years old`);
//     } else {
//       console.log(`Dog number ${i + 1} is still a puppy 🐶`);
//     }
//   });
// };

// checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
// console.log('   -------------------------------   ');
// checkDogs([[9, 16, 6, 8, 3]], [10, 5, 6, 1, 4]);

// ///////////////////////////////////////
// /** Data Transformations: MAP, FILTER, REDUCE */

// // The MAP Method
// const eurToUSD = 1.1;

// const movementsToUSD = movements.map(function (mov) {
//   return mov * eurToUSD;
// });
// console.log(movements);
// console.log(movementsToUSD);

// // Same but using a traditional for-loop
// const movementsToUSDfor = [];
// for (const mov of movements) {
//   movementsToUSDfor.push(mov * eurToUSD);
// }
// console.log(movementsToUSDfor);

// // Using an arrow function:
// const movementsToUSDArrow = movements.map(mov => mov * eurToUSD);
// console.log(movementsToUSDArrow);

// // const movementsDescriptions = movements.map((mov, i, arr) => {
// //   if (mov > 0) {
// //     return `Movement ${i + 1}: You deposited ${mov}`;
// //   } else {
// //     return `Movement ${i + 1}: You withdrew ${Math.abs(mov)}`;
// //   }
// // });

// // Simplified
// const movementsDescriptions = movements.map(
//   (mov, i) =>
//     `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
//       mov
//     )}`
// );
// console.log(movementsDescriptions);

// // The FILTER Method
// const deposits = movements.filter(mov => mov > 0);
// console.log(deposits);

// const depositsFor = [];
// for (const mov of movements) {
//   if (mov > 0) {
//     depositsFor.push(mov);
//   }
// }
// console.log(depositsFor);

// const withdrawals = movements.filter(mov => mov < 0);
// console.log(withdrawals);

// // The REDUCE Method
// const balance = movements.reduce((acc, mov, i, arr) => {
//   console.log(`Iteration ${i}: acc = ${acc}, movement = ${mov}`);
//   return acc + mov;
// }, 0);
// console.log(balance);

// const balance2 = movements.reduce((acc, cur) => acc + cur, 0);

// let balance3 = 0;
// for (const mov of movements) {
//   balance3 += mov;
// }

// // Get the movements arrays MAXIMUM value
// const max = movements.reduce((acc, mov) => {
//   if (acc > mov) return acc;
//   else return mov;
// }, movements[0]);
// console.log(max);

// ///////////////////////////////////////
// // Coding Challenge #2

// /*
// Let's go back to Julia and Kate's study about dogs. This time,
// they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

// Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

// 1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge.
//    If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
// 2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
// 3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
// 4. Run the function for both test datasets

// TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
// TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

// GOOD LUCK 😀
// */

// const calcAverageHumanAge = function (ages) {
//   const humanAges = ages.map(age => (age <= 2 ? 2 * age : 16 + age * 4));
//   const adults = humanAges.filter(age => age >= 18);

//   // alt. calculation (2,3 = (2+3)/2 or 2/2 + 3/2 = 2.5)
//   // const avg = adults.reduce((acc, age, i, arr) => acc + age / arr.length, 0);

//   // average = the sum (via reduce) / num of elements
//   const average = adults.reduce((acc, cur) => acc + cur, 0) / adults.length;
//   // return avg;
//   return average;
// };

// console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
// console.log(calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]));

// ///////////////////////////////////////

// /** Methods Chaining */

// // PIPELINE
// const totalDepositsUSD = Math.trunc(
//   movements
//     .filter((cur, i, arr) => cur > 0)
//     .map((cur, i, arr) => {
//       console.log(arr);
//       return cur * eurToUSD;
//     })
//     .reduce((acc, cur, i, arr) => acc + cur, 0)
// );
// console.log(totalDepositsUSD);

// ///////////////////////////////////////
// // Coding Challenge #3

// /*
// Rewrite the 'calcAverageHumanAge' function from the previous challenge, but this time as an arrow function, and using chaining!

// TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
// TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

// GOOD LUCK 😀
// */

// const calcAverageHumanAge2 = ages =>
//   ages
//     .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
//     .filter(age => age >= 18)
//     .reduce((acc, age, i, arr) => acc + age / arr.length, 0);
// // adults.length

// const avg1 = calcAverageHumanAge2([5, 2, 4, 1, 15, 8, 3]);
// const avg2 = calcAverageHumanAge2([16, 6, 10, 5, 6, 1, 4]);
// console.log(avg1, avg2);

// /** The FIND Method */
// const firstWithdrawal = movements.find(mov => mov < 0);
// console.log(firstWithdrawal);

// const account = accounts.find(acc => acc.owner.includes('Jessica'));
// console.log(account);

// /** INCLUDES, SOME, EVERY */
// console.log(movements.includes(-130));
// // Equivalent to:
// movements.some(mov => mov === -130);

// const anyDeposits = MouseEvent.some(mov => mov > 0);
// console.log(anyDeposits);

// console.log(account4.movements.every(mov => mov > 0));

// // Separate callbacks
// const deposit = mov => mov > 0;
// console.log(account1.movements.some(deposit));
// console.log(account2.movements.every(deposit));
// console.log(account3.movements.filter(deposit));

/** FLAT AND FLATMAP (ES2019) */
const nestedArr = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log(nestedArr.flat());

const deepNestedArr = [[[1, 2], 3], [4, [5, 6]], 7, 8];
console.log(deepNestedArr.flat(1));
console.log(deepNestedArr.flat(2));

const accountMovements = accounts.map(acc => acc.movements);
console.log(accountMovements);
const allMovements = accountMovements.flat();
console.log(allMovements);

// Using chaining: FLAT
const overallBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
console.log(overallBalance);

// FLATMAP  (map + flat)
const overallBalance2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
console.log(overallBalance2);

/** Sorting Arrays */
const owners = ['Jonas', 'Zack', 'Adam', 'Martha'];
console.log(owners.sort());
console.log(owners); // Mutates the Array!!

// Numbers

// Ascending Order
// return < 0: A, B (keep order)
// return > 0: B, A (switch order)
// movements.sort((a, b) => {
//   if (a > b) return 1;
//   if (a < b) return -1;
// });
movements.sort((a, b) => a - b);
console.log(movements);

// Descending Order
// movements.sort((a, b) => {
//   if (a > b) return -1;
//   if (a < b) return 1;
// });
movements.sort((a, b) => b - a);
console.log(movements);
