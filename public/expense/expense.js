//function to save expense to local storage and backend
function saveToStorage(event) {
    event.preventDefault();

    const eamount = event.target.eamount.value;
    const edescription = event.target.edescription.value;
    const category = event.target.category.value;
    const token = localStorage.getItem('token');

    const obj = {
        eamount,
        edescription,
        category,
    }

    axios.post("http://localhost:4000/user/addExpense", obj, {
        headers: { "Authorization": token }
    })
        .then((response) => {
            console.log(response);
            showListofRegisteredExpenses(response.data.newExpenseDetail)
        }).catch((err) => {
            console.log(err);
        });

    //clear inout fields
    document.getElementById('ed').value = '';
    document.getElementById('ea').value = '';
    document.getElementById('cl').value = '';
}

//function to show list of registered expenses
function showListofRegisteredExpenses(user) {
    const parentNode = document.getElementById('listOfExpenses');
    const createNewUserHtml = `<li id=${user.id}>${user.eamount} - ${user.edescription} -${user.category} 
                                            <button onclick="deleteUser('${user.id}')">Delete</button>
                                            <button onclick="editUser('${user.id}','${user.edescription}','${user.eamount}','${user.category}')">Edit</button>
                                           
                                         </li>
                                        `
    parentNode.innerHTML += createNewUserHtml;

    document.getElementById('ed').value = '';
    document.getElementById('ea').value = '';
    document.getElementById('cl').value = '';
}

// Function to check if user is premium and update UI accordingly
function checkIfPremiumUser() {
    let userType = localStorage.getItem('user');

    if (userType == "true") {
        premiumUser();
        reportDown();
        getPremiumLeaderboard();
    }
}


// Fetch and display expenses on page load
window.addEventListener('DOMContentLoaded', async (event) => {
    try {
        const token = localStorage.getItem('token');

        // 1. URL simplified to remove the page variable
        // 2. Changed to .get since we are no longer sending pagination metadata in a post body
        const response = await axios.get(`http://localhost:4000/user/getExpenses`, {
            headers: { "Authorization": token }
        });

        if (response.status === 200) {
            const listOfUsers = document.getElementById('listOfExpenses');
            listOfUsers.innerHTML = '';

            // 3. Logic to handle the data array
            // If your backend now returns the array directly, use response.data
            // If it still returns an object with a data property, use response.data.data
            const expenses = response.data.data || response.data;

            expenses.forEach(expense => {
                showListofRegisteredExpenses(expense);
            });
        }
    } catch (err) {
        console.error("Error fetching expenses:", err);
    }
});



// function for deleteExpense
function deleteUser(userId) {
    const token = localStorage.getItem('token');

    axios.delete(`http://localhost:4000/user/deleteExpense/${userId}`, { headers: { "Authorization": token } })
        .then((response) => {
            removeItemFromScreen(userId);
        }).catch((err) => {
            console.log(err);
        });
}

//function for edit expense
function editUser(userId, expenseDescription, expenseAmount, expenseCategory) {
    document.getElementById('ed').value = expenseDescription;
    document.getElementById('ea').value = expenseAmount;
    document.getElementById('cl').value = expenseCategory;

    deleteUser(userId);
}

//function to remove item from screen
function removeItemFromScreen(userId) {
    const parentNode = document.getElementById('listOfExpenses');
    const elem = document.getElementById(userId)
    parentNode.removeChild(elem);
}

//payment gateway integration with razorpay
async function payment(e) {
    const token = localStorage.getItem('token');

    const response = await axios.get('http://localhost:4000/purchase/premiummembership', { headers: { "Authorization": token } });

    console.log(response);
    var options =
    {
        "key": response.data.key_id, // Enter the Key ID generated from the Dashboard
        "name": "Test Expense Tracker",
        "order_id": response.data.order.id, // For one time payment
        "prefill": {
            "name": "Test Leelanand Sah",
            "email": "sah@example.com",
            "contact": "7827664983"
        },
        "theme": {
            "color": "#3399cc"
        },
        // This handler function will handle the success payment "color": "#3399cc"
        "handler": function (response) {
            console.log(response);


            axios.post('http://localhost:4000/purchase/updatetransactionstatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
            }, { headers: { "Authorization": token } })
                .then(() => {
                    localStorage.setItem('user', true);
                    premiumUser();
                    //getPremiumLeaderboard();
                    alert('You are a Premium User Now')
                }).catch(() => {
                    alert('Something went wrong. Try Again!!!')
                })
        },
    };

    // 3. Handle Failure
    const rzp1 = new Razorpay(options);
    rzp1.open();

    rzp1.on('payment.failed', async function (errRes) {
        console.error("Payment Failed:", errRes.error);
        alert('Payment Failed');

        try {
            await axios.post(`http://localhost:4000/purchase/updatetransactionstatusfailed`, {
                order_id: options.order_id,
                payment_id: errRes.error.metadata.payment_id
            }, { headers: { "Authorization": token } });
        } catch (err) {
            console.error("Failed status update error:", err);
        }
    });

}


// Function to handle premium user UI changes
function premiumUser() {
    const premium = document.getElementById('premium');
    premium.innerHTML = 'Its Premium Account'

    document.body.classList.remove('light');
    document.body.classList.add('dark');
    document.getElementsByClassName('center')[0].classList.remove('light');
    document.getElementsByClassName('center')[0].classList.add('dark');
    document.getElementById('expense-div').classList.remove('light');
    document.getElementById('expense-div').classList.add('dark');
    document.getElementById('left').classList.remove('light');
    document.getElementById('left').classList.add('dark');
    document.getElementsByTagName('input')[0].classList.add('dark');
    document.getElementById('right').style = 'display:block';
}


// Function to show leaderboard
async function getPremiumLeaderboard() {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://localhost:4000/expense/premiums', { headers: { 'Authorization': token } })

        if (response.data.success) {
            console.log(response);
            if (response.data.data.length > 0) {
                response.data.data.sort((a, b) => {
                    return a.totalExpense - b.totalExpense;
                });
                console.log(response.data.data[0].user.username);
                console.log(response.data.data[0].user)


                response.data.data.map((user, id) => {  //transform each element of an array and creates a new array out of the arguement which
                    console.log(id);                       //we are passing
                    showLeaderboard(user, id);
                })

            }
        }
    } catch (err) {
        console.log(err);
    }
}


