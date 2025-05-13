import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './styles.css'

function TitleScreen() {
  let navigateTo = useNavigate();

  function handleClick() {
    navigateTo('/level');
  }

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        handleClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <p className='press-start-2p-regular' style={{ fontSize: '50px', color: 'white', textAlign: 'center' }}>Tiedustelijan<br></br>----kosto----</p>
      <button
        onClick={handleClick}
        className='press-start-2p-regular'
        style={{
          fontSize: '30px',
          backgroundColor: 'rgb(20, 20, 30)',
          color: 'white',
          border: '3px solid white',
          display: 'inline-block',
          padding: '25px',
          cursor: 'pointer',
          boxShadow: '7px 7px rgb(255, 255, 255)',         
        }}>Paina ⏎ Enter<br></br>aloittaaksesi pelin</button>
    </div>
  );
}

export default TitleScreen