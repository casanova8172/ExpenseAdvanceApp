
function saveToStorage(event) {
    event.preventDefault();

    const eamount = event.target.eamount.value;
    const edescription = event.target.edescription.value;
    const category = event.target.category.value;
    //const token = localStorage.getItem('token');

    const obj = {
        eamount,
        edescription,
        category,
    }

    axios.post('http://localhost:4000/user/addExpense', obj)
        .then((response) => {
            console.log(response);
            showListofRegisteredExpenses(response.data.newExpenseDetail)
        }).catch((err) => {
            console.log(err);
        })

    // axios.post("http://localhost:5000/user/addExpense", obj, { 
    //     headers: { "Authorization": token } })
    //     .then((response) => {
    //     console.log(response);
    //     showListofRegisteredExpenses(response.data.newExpenseDetail)
    // }).catch((err) => {
    //     console.log(err);
    // })

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

window.addEventListener('DOMContentLoaded', (event) => {

    // event.preventDefault();
    // let Items_Per_Page = +document.getElementById('Items_Per_Page')
    // // Items_Per_Page = +event.target.Items_Per_Page.value;    ${page}
    // const token = localStorage.getItem('token');
    // let page = 1;
    // let response = await axios.post(`http://localhost:4000/user/getExpenses/${page}`, { Items_Per_Page: Items_Per_Page }, { headers: { "Authorization": token } })

    // checkIfPremiumUser();

    // if (response.status === 200) {
    //     // console.log(response.data);
    //     //console.log(response.data.data[0]);
    //     console.log('?????????????');
    //     console.log(response.data);
    //     const listOfUsers = document.getElementById('listOfExpenses')

    //     console.log(response.data.info);
    //     listOfUsers.innerHTML = '';
    //     for (let i = 0; i < response.data.data.length; i++) {

    //         showListofRegisteredExpenses(response.data.data[i]);

    //     }

    //     showPagination(response.data.info);
    // }
    // just fetch all expenses without pagination and auth
    axios.get("http://localhost:4000/user/getExpenses")
        .then((response) => {
            //console.log(response.data.data[0]);
            //checkIfPremiumUser();
            for (let i = 0; i < response.data.data.length; i++) {

                showListofRegisteredExpenses(response.data.data[i]);
            }
        }).catch((err) => console.log(err));
})

// function for deleteExpense
function deleteUser(userId) {
    //const token = localStorage.getItem('token');

    axios.delete(`http://localhost:4000/user/deleteExpense/${userId}`)
        .then((response) => {
            const parentNode = document.getElementById('listOfExpenses');
            const elem = document.getElementById(userId)
            parentNode.removeChild(elem);

        }).catch((err) => {
            console.log(err);
        })
}
