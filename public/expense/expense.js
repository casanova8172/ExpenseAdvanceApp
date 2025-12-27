
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

function removeItemFromScreen(userId) {
    const parentNode = document.getElementById('listOfExpenses');
    const elem = document.getElementById(userId)
    parentNode.removeChild(elem);
}
