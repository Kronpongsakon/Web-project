import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube,faAngleRight,faUser } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription, gql } from "@apollo/client";

function App() {
  const GET_TODO_WITH_USER = gql`
    query {
      todos(order_by: {created_at: desc}) {
        title
        user {
          id
          name
        }
      }
    }
  `;

  const GET_USER = gql`
    query {
      users {
          name
        }
      }
  `;

  const CREATE_TODO = gql`
    mutation CreateTodo($user_id: Int!, $title: String!) {
      insert_todos(objects: { user_id: $user_id, title: $title }) {
        affected_rows
        returning {
          title
          user_id
        }
      }
    }
  `;

  const DELETE_ALL_TODOS = gql`
    mutation DeleteAllTodo {
      delete_todos (where: {}) {
        affected_rows
      }
    }
  ` ;

  const TODO_SUBSCRIPTION = gql`
    subscription {
      todos(order_by: { created_at: desc }) {
        title
        user {
          id
          name
        }
      }
    }
  `;

  const { data: listTodos } = useQuery(GET_TODO_WITH_USER);
  const { data: newListTodos } = useSubscription(TODO_SUBSCRIPTION);
  const { data: listUser } = useQuery(GET_USER);
  const [createTodo] = useMutation(CREATE_TODO);
  const [deleteAllTodos] = useMutation(DELETE_ALL_TODOS);
  const [todos, setTodos] = useState([]);
  const [comment, setComment] = useState("");
  const [hasNewTodo, setHasNewTodo] = useState(false);
  const [users, setUser] = useState([]);
  let item = []
  const type_item = ["All", "Active", "Completed", "Clear Completed"]

  const handleCreateTodo = async () => {
    try {
      await createTodo({
        variables: { user_id: 1, title: comment },
      });
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  const handleChangeInput = e => {
    setComment(e.target.value);
  };

  const handleKeypressInput = e => {
  if (e.key === "Enter") {
    handleSubmit();
  }
  };

  const handleSubmit = () => {
    handleCreateTodo();
    var newTodos = [...todos]
    newTodos.unshift({title: comment, user: {name: "Kronpongsakon Kronkum"}})
    setTodos(newTodos)
    setComment("");
  };

  const handleDeleteTodo = () => {
    deleteAllTodos()
      .then(() => {setTodos([])})
      .catch(error => {
        console.error('Error deleting all todos:', error);
      });
  };

  const handleNewTodo = () => {
    setHasNewTodo(false);
    const maxHightTodoDiv = document.querySelector('.max-hight-todo');
    if (maxHightTodoDiv) {
     maxHightTodoDiv.scrollTo({
       top: 0,
       behavior: 'smooth'
     });
   }
   setTodos(newListTodos.todos)
 }

  useEffect(() => {
    if (listTodos && listTodos.todos) {
      setTodos(listTodos.todos);
    }
  }, [listTodos]);

  useEffect(() => {
    if (listUser) {
      setUser(listUser.users);
    }
  }, [listUser]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (newListTodos && newListTodos.todos) {
      if (todos.length !== newListTodos.todos.length){
        setHasNewTodo(true)
      }
    }
  }, [newListTodos]);
  // eslint-enable-next-line react-hooks/exhaustive-deps
  return (
    <div>
      <div className='logout-box'>
        <div className='row me-0'>
          <div className='col-6 d-flex pe-0'>
            <div className='pt-2 px-2'>
            <FontAwesomeIcon icon={faCube} />
            </div>
            <div className="text-size fw-bold p2">Test Web app</div>
          </div>
          <div className="col-6 px-0">
            <div className="d-flex justify-content-end">
              <button className="button-box logout-button mt1">Log out</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-2 me-0">
        <div className="col-4 background-orange">
          <div className="p-2">
            <div className="text-size fw-bold border-bottom-red">
              Personal todos
            </div>
            <div className="d-flex mt-2">
              <div className='px-2 pt-3 position-absolute'>
                <FontAwesomeIcon icon={faAngleRight} />
              </div>
              <input type="text" className="text-size fw-bold input-text py-2 w-100 border-radius-input" placeholder="What needs to be done?"/>
            </div>
            <div className="background-white box border-radius-input mt-2 p-2">
              <div className="d-flex align-items-center">
                  <div className='px-2 mt-1'>{item.length} item</div>
                  <div>{type_item.map((type, index) => (
                    <button key={index} className="ms-1 button-box-type fw-bold mt-1">{type}</button>
                  ))}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-4 background-green">
          <div className="p-2">
            <div className="row border-bottom-red">
              <div className="col-8 text-size fw-bold">
                Public feed (realtime)
              </div>
              <div className="col-4 d-flex justify-content-end align-items-center">
                <button className="button-box delete-button mt1" onClick={handleDeleteTodo}>Delete All Todo</button>
              </div>
            </div>
            <div className="d-flex mt-2">
              <div className='px-2 pt-3 position-absolute'>
                <FontAwesomeIcon icon={faAngleRight} />
              </div>
              <input type="text" 
                className="text-size fw-bold input-text py-2 w-100 border-radius-input" 
                placeholder="What needs to be done?"
                value={comment} 
                onChange={handleChangeInput}
                onKeyPress={handleKeypressInput}
              />
            </div>
            { hasNewTodo ? (<div className='d-flex justify-content-center'>
                  <button className='button-box-type mt-1 position-absolute' onClick={handleNewTodo}>Have new Todo</button>
              </div>) : null}
            <div className="max-hight-todo">  
              {todos.map((todo, index) => (
              <div key={index} className="background-white box border-radius-input mt-2 p-2">
                <div className="d-flex align-items-center">
                  <div className="nameUser fw-bold p-1">@{todo.user.name}</div>
                  <div className="ms-2">{todo.title}</div>
                </div>
              </div>
              ))}   
            </div>
            
          </div>
        </div>

        <div className="col-4 background-yellow">
          <div className="p-2">
            <div className="text-size fw-bold border-bottom-red mb-user">Online_user - {users.length}</div>
            <div>{users.map((user, index) => (
              <div key={index} className="d-flex align-items-center pt-2">
                <div className='pt-3 mb-1'>
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div className="text-size text-bold ps-2 pt-2">{user.name}</div>
              </div>
            ))}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
