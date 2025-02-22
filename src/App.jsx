import { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Square from './Square';
import './styles.css'
import character from './character.png';
import moveRadius from './moveRadius.png';
import spiderweb from './spiderweb.png';
import obstacle from './obstacle.png';
import EndScreen from './EndScreen';
import Level from './Level';

const router = createBrowserRouter([
 {
   path: '/',
   element: <Level />
},
 {
    path: 'endscreen',
    element: <EndScreen />
 },
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App

