import logo from './logo.svg';
import './App.css';
import Playground from './component/ArticleForm';
import List from './component/List';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MemberForm from './component/MembersForm';
import ArticleForm from './component/ArticleForm';

const router = createBrowserRouter([
  {
    path: '/',
    element: <List />
  },
  {
    path: '/member',
    element: <MemberForm />
  },
  {
    path: '/article',
    element: <ArticleForm />
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
