import logo from './logo.svg';
import './App.css';
import Playground from './component/ArticleForm';
import List from './component/List';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MemberForm from './component/MembersForm';
import ArticleForm from './component/ArticleForm';
import MinutesForm from './component/MinutesForm';
import Login from './component/Login';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/list',
    element: <List />
  },
  {
    path: '/member',
    element: <MemberForm />
  },
  {
    path: '/article',
    element: <ArticleForm />
  },
  {
    path: '/minute',
    element: <MinutesForm />
  }
]);

function App() {
  return (
    <div className="App">
      {/* <Playground /> */}
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
