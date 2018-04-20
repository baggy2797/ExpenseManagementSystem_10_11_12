// Budget controller
var budgetController = (function() 
{
  // Function constructor needed
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(curEl) {
      sum += curEl.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
    exp: 0,
    inc: 0
    },
    budget: 0,
    percentage: -1
  };


  return {
    addItem: function(type, desc, val) {
      var newItem, ID;

      // ID = (last ID + 1)
      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new "inc" or "exp" item
      if (type === "exp") {
        newItem = new Expense(ID, desc, val);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val);
      }

      // "type" will be exp or inc, push new item into the array
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },


    deleteItem: function(type, id) {
      // data.allItems[type][id]; (doesnt work with gaps in ids!)
      var ids, index;
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },


    calculateBudget: function() {
      // 1. Calculate total income and expense values
      calculateTotal("exp");
      calculateTotal("inc");

      // 2. Calculate the budget, income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // 3. Calculate percentage of income that is spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },


    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },


    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },


    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  }

})();




// UI controller
var UIController = (function() {




  // Need to prevent issues if any names are changed by adding to new object
  var stringsForDOM = {
    inputType: ".add_type",
    inputDescription: ".add_description",
    inputValue: ".add_value",
    inputButton: ".add_btn",
    incomeContainer: ".income_list",
    expensesContainer: ".expenses_list",
    budgetLabel: ".budget_value",
    incomeLabel: ".budget_income-value",
    expenseLabel: ".budget_expenses-value",
    percentageLabel: ".budget_expenses-percentage",
    container: ".container",
    expensesPercLabel: ".item_percentage",
    dateLabel: ".budget_title-month"
  };


  var formatNumber = function(num, type) {
    // + or - before the number (EG: + 200, - 401)
    // Add 2 decimal points (EG: 235.91)
    // Use comma separation where needed (EG: 4,091)
    var numSplit, inc, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".")

    int = numSplit[0];
    if (int.length > 3) { //Greater than 3 digits = needs a comma!
      int = int.substr(0, (int.length - 3)) + "," + int.substr((int.length - 3), 3)
    }
    dec = numSplit[1];

    return ((type === "exp" ? sign = "-" : sign = "+") + " " + int + "." + dec);
  };


  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };


  return {
    getinput: function() {
      return {
        type: document.querySelector(stringsForDOM.inputType).value,
        // NOTE: will be "inc" or "exp"!
        description: document.querySelector(stringsForDOM.inputDescription).value,
        value: parseFloat(document.querySelector(stringsForDOM.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;
      // Need HTML string with placeholder text

      if (type === "inc") {
        element = stringsForDOM.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%">\
          <div class="item_description">%description%</div>\
          <div class="right clearfix"><div class="item_value">%value%</div>\
          <div class="item_delete"><button class="item_delete-btn"><i class="fa fa-times" aria-hidden="true"></i>\
          </i></button></div></div></div>';

      } else if (type === "exp") {
        element = stringsForDOM.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%">\
          <div class="item_description">%description%</div><div class="right clearfix">\
          <div class="item_value">%value%</div><div class="item_percentage">0%</div>\
          <div class="item_delete"><button class="item_delete-btn"><i class="fa fa-times" aria-hidden="true"></i>\
          </i></button></div></div></div>';
      }


      // Allow data to replace placeholder text
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


      // Insert HTML into DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },


    deleteListItem: function(selectorID) {
      var delEl = document.getElementById(selectorID);
      delEl.parentNode.removeChild(delEl);
    },


    clearFields: function() {
      var fields, fieldsArray;

      fields = document.querySelectorAll(stringsForDOM.inputDescription + ", " + stringsForDOM.inputValue);

      // Need to "suggest" that fields is an array so I can slice!
      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });

      // Reset focus to description after entry submission
      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(stringsForDOM.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(stringsForDOM.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
      document.querySelector(stringsForDOM.expenseLabel).textContent = formatNumber(obj.totalExp, "exp");


      if (obj.percentage > 0) {
        document.querySelector(stringsForDOM.percentageLabel).textContent = obj.percentage + "%";
      } else {
        document.querySelector(stringsForDOM.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(stringsForDOM.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayDate: function() {
      var now, year, month, months, day;

      now = new Date();

      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      month = now.getMonth();

      day = now.getDate();

      year = now.getFullYear();
      document.querySelector(stringsForDOM.dateLabel).textContent = months[month] + " " + day + ", " + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        stringsForDOM.inputType + "," +
        stringsForDOM.inputDescription + "," +
        stringsForDOM.inputValue);

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(stringsForDOM.inputButton).classList.toggle("red");
    },

    getStringsForDOM: function() {
      return stringsForDOM;
    }
  };
})();



// Global app controller

var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getStringsForDOM();
    document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function(event) {
      // console.log(event);
      if (event.keyCode === 13 || event.which === 13) {
        // console.log("Enter was pressed");
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
  };



  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display budget on UI
    //console.log(budget); //<< Keep in case something breaks!
    UICtrl.displayBudget(budget);
  };


  var updatePercentages = function() {
    // 1. Work out the percentages
    budgetCtrl.calculatePercentages();

    // 2. Read them from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update user interface with new values
    // console.log(percentages);
    UICtrl.displayPercentages(percentages);
  };


  var ctrlAddItem = function() {
    var input, newItem;

    // 1. Get filled input data
    input = UICtrl.getinput();
    // console.log(input);
    // Need input validation adding
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add item to budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add item to UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Wipe fields after adding to income or expense
      UICtrl.clearFields();
      // console.log("Does this work?");

      // 5. Calculate and update the budget
      updateBudget();

      // 6. Calculate the percentages and update
      updatePercentages();
    }
  };


  var ctrlDeleteItem = function(event) {
    // console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      //inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from User Interface
      UICtrl.deleteListItem(itemID);

      // 3. Reflect changes to the displayed totals
      updateBudget();

      // 4. Calculate the percentages and update
      updatePercentages();
    }
  };


  return {
    init: function() {
      console.log("Application has started");
      UICtrl.displayDate();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  }

})(budgetController, UIController);


controller.init();
