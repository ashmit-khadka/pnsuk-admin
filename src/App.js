import logo from './logo.svg';
import './App.css';
import Playground from './component/playground';
import List from './component/List';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MemberForm from './component/MembersForm';

const router = createBrowserRouter([
  {
    path: '/',
    element: <List />
  },
  {
    path: '/members',
    element: <MemberForm />
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
