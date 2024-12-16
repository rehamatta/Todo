'use strict'

const formElement = document.querySelector('form');
const inputElement = document.querySelector('.entered-task');
const apiKey = '675ec65160a208ee1fde252d';
const loadingScreen = document.querySelector('.loading');
let allTodos = [];

if(getAllTodos()) getAllTodos();

formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    if(inputElement.value.trim()){
        addTodo();
    }
})
async function addTodo() {
    showLoading();
    const obj = {
        title: inputElement.value,
        apiKey: apiKey
    };     
    const response = await fetch('https://todos.routemisr.com/api/v1/todos', {
        method:'POST',
        body: JSON.stringify(obj),
        headers:{
            'content-type': 'application/json'
        }
    });
    if(response.ok){ // backend has no error -> status
        const data = await response.json();
        console.log(data);
        if(data.message === 'success') {
            await getAllTodos();
            toastr.success('Added Successfully!', 'Todo')          
            formElement.reset();
        }
    };
    hideLoading();
}
async function getAllTodos() {
    showLoading();
    const response = await fetch(`https://todos.routemisr.com/api/v1/todos/${apiKey}`);
    if(response.ok) { // status
        const data = await response.json();
        if(data.message === 'success') {
            allTodos = data.todos;
            displayAllTodos();
        }
    }
    hideLoading();
}
function displayAllTodos() {
    let cartona = '';
    for (const item of allTodos) {
        cartona += `
            <li class="todo d-flex align-items-center justify-content-between py-3 border-bottom">
                <span onclick="markCompleted('${item._id}')" class="task-name text-secondary" style="${item.completed ? 'text-decoration: line-through;' : ''}">${item.title}</span>
                <div class="d-flex align-items-center gap-3">
                    ${item.completed ? '<span class="chech-icon"><i class="fa-regular fa-circle-check"></i></span>' : ''}
                    <span onclick="deleteTodo('${item._id}')" class="trash-icon"><i class="fa-solid fa-trash-can"></i></span>
                </div>
            </li>      
        `;
    }
    document.querySelector('ul').innerHTML = cartona;
    changeProgress();
}
async function deleteTodo(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then( async(result) => {
        if (result.isConfirmed) {
            showLoading();
            const obj = {
                todoId : id
            }
            const response = await fetch('https://todos.routemisr.com/api/v1/todos',{
                    method: 'DELETE',
                    body: JSON.stringify(obj),
                    headers:{
                        'content-type': 'application/json'
                    }
                }
            );
            if(response.ok) {
                const data = await response.json();
                if(data.message === 'success') {
                    await getAllTodos();
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your Todo has been deleted.",
                        icon: "success"
                      });
                };
            };
            hideLoading();
        }
      });      
}
async function markCompleted(id) {
    Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Complete it!"
      }).then(async(result) => {
        if (result.isConfirmed) {
            showLoading();
            const obj = {
                todoId : id
            }
            const response = await fetch('https://todos.routemisr.com/api/v1/todos', {
                method: 'PUT',
                body: JSON.stringify(obj),
                headers:{
                    'content-type': 'application/json'
                }
            });
            if(response.ok) {
                const data = await response.json();
                if(data.message === 'success') {
                    await getAllTodos();
                    Swal.fire({
                        title: "Completed!",
                        icon: "success"
                      });            
                }
            }
            hideLoading();
        }
      });
}
function showLoading() {
    loadingScreen.classList.remove('d-none');
}
function hideLoading() {
    loadingScreen.classList.add('d-none');
}
function changeProgress() {
    const completedTask = allTodos.filter((todo) => todo.completed).length;
    const totalTasks = allTodos.length;
    let changeWidth = (completedTask / totalTasks) * 100;
    document.getElementById('progress').style.width = `${changeWidth}%`;
    document.querySelector('.completed-task').innerText = completedTask;
    document.querySelector('.all-task').innerText = totalTasks;
}