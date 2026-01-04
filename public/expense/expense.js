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


// Fetch and display expenses on page load
window.addEventListener('DOMContentLoaded', async (event) => {
    try {
        const token = localStorage.getItem('token');

        // 1. URL simplified to remove the page variable
        // 2. Changed to .get since we are no longer sending pagination metadata in a post body
        const response = await axios.get(`http://localhost:4000/user/getExpenses`, {
            headers: { "Authorization": token }
        });

        checkIfPremiumUser();

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


// Function to check if user is premium and update UI accordingly
function checkIfPremiumUser() {
    let userType = localStorage.getItem('user');

    if (userType == "true") {
        premiumUser();
        reportDown();
        getPremiumLeaderboard();
    }
}

// Function to download expense report
function reportDown() {
    const down = document.getElementById('report');
    down.innerHTML = 'report';
}



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
                    getPremiumLeaderboard();
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
    // 1. Update Premium Status Text
    const premiumLabel = document.getElementById('premium');
    if (premiumLabel) {
        premiumLabel.innerHTML = '✨ Premium Account';
        premiumLabel.style.color = '#0e0d0dff'; // Gold color for premium feel
    }

    document.body.classList.remove('light');
    document.body.classList.add('premium-mode');

    const rightSection = document.getElementById('right');
    if (rightSection) {
        rightSection.style.display = 'block';
    }
}


// Function to show leaderboard
async function getPremiumLeaderboard() {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://localhost:4000/expense/premiums', { headers: { 'Authorization': token } })

        console.log("response:......", response.data.data);

        if (response.data.success && response.data.data.length > 0) {
            response.data.data.map((user, id) => {
                showLeaderboard(user, id);
            })
        }
    } catch (err) {
        console.log(err);
    }
}

// Function to display each user in the leaderboard
function showLeaderboard(user, index) {
    const leaderboardDiv = document.getElementById('right')
    let child = `<li class="leaderboardList">
                    <p class="sno">${index + 1} </p>
                    <p class="name" id="user" onclick="openUserExpenses('${user.id}')">${user.username}</p>
                    <p class="name">${user.totalExpense}</p>
            </li>`

    leaderboardDiv.innerHTML += child
}


