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
    <div className='endscreen' style={{ backgroundColor: 'rgb(253,232,103)', backgroundImage: `url(${end})` }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
      }}>
        <p style={{ margin: 0, padding: '20px 0', fontSize: '50px', color: 'white' }}>Loppu</p>
        {showButton && (
          <div>
            <button
              onClick={handleClick}
              className='fadeIn endscreen-button'>
              Uusi peli?<br></br>Paina ⏎ Enter</button>
            <button
              onClick={handleClick}
              className='fadeIn endscreen-button-mobile'>
              Uusi peli?</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EndScreen;