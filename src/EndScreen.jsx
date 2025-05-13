import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import end from './kuvat/end.jpg';
import './styles.css';

function EndScreen() {
  let navigateTo = useNavigate();
  const [showButton, setShowButton] = useState(false);

  function handleClick() {
    navigateTo('/level');
  }

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && showButton) {
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showButton]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      backgroundImage: `url(${end})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '500px',
      width: '500px',
      border: 'solid 5px white',
      textAlign: 'center',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
      }}>
        <p className='press-start-2p-regular' style={{ margin: 0, padding: '20px 0', fontSize: '50px', color: 'white', textAlign: 'center' }}>Loppu</p>
        {showButton && (
          <button
            onClick={handleClick}
            className='press-start-2p-regular fadeIn'
            style={{
              fontSize: '17px',
              backgroundColor: 'rgb(20, 20, 30)',
              color: 'white',
              border: '3px solid white',
              display: 'inline-block',
              padding: '20px',
              cursor: 'pointer',
              boxShadow: '7px 7px rgb(255, 255, 255)',
              lineHeight: '1.5',
              margin: '0 0 60px 0',
            }}>Uusi peli?<br></br>Paina ⏎ Enter</button>
        )}
      </div>
    </div>
  );
}

export default EndScreen;