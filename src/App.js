import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube,faAngleRight,faUser } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react';
import { useQuery,useMutation, gql } from "@apollo/client";

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

  const { data: listTodos, refetch } = useQuery(GET_TODO_WITH_USER);
  const { data: listUser } = useQuery(GET_USER);
  const [createTodo] = useMutation(CREATE_TODO);
  const [todos, setTodos] = useState([]);
  const [comment, setComment] = useState("");
  const [newTodo, setNewTodo] = useState();
  const [users, setUser] = useState([]);

  const handleCreateTodo = async () => {
    try {
      const response = await createTodo({
        variables: { user_id: 1, title: comment },
      });
      await setNewTodo(response.data.insert_todos.returning)
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
    setComment("");
  };

  useEffect(() => {
    if (listTodos) {
      setTodos(listTodos.todos);
    }
  }, [listTodos]);

  useEffect(() => {
    if (listUser) {
      setUser(listUser.users);
    }
  }, [listUser]);

  const handleNewTodo = () => {
     refetch();
     setNewTodo();
  }

  let item = []
  const type_item = ["All", "Active", "Completed", "Clear Completed"]
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
              <button className="button-box logout-text mt1">Log out</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-2 me-0 max-hight-todo">
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
                  <div>{type_item.map((type) => (
                    <button class="ms-1 button-box-type fw-bold mt-1">{type}</button>
                  ))}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-4 background-green">
          <div className="p-2">
            <div className="text-size fw-bold border-bottom-red">
              Public feed (realtime)
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
            { newTodo ? (<div className='d-flex justify-content-center mt-2'>
                <button className='button-box-type' onClick={handleNewTodo}>Have new Todo</button>
            </div>) : ""}
            <div>
              {todos.map((todo) => (
              <div className="background-white box border-radius-input mt-2 p-2">
                <div className="d-flex align-items-center">
                  <div class="nameUser fw-bold p-1">@{todo.user.name}</div>
                  <div class="ms-2">{todo.title}</div>
                </div>
              </div>
              ))}   
            </div>
            
          </div>
        </div>

        <div className="col-4 background-yellow">
          <div className="p-2">
            <div className="text-size fw-bold border-bottom-red mb-user">Online_user - {users.length}</div>
            <div>{users.map((user) => (
              <div className="d-flex align-items-center pt-2">
                <div className='pt-3 mb-1'>
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div class="text-size text-bold ps-2 pt-2">{user.name}</div>
              </div>
            ))}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
