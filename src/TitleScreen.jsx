import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import logo from './kuvat/logo.svg';
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
    <div className='titlescreen'>
      <img style={{ margin: '13px 10px' }} src={logo} alt='Logo'></img>
      <img style={{ margin: '13px 10px', transform: 'scaleX(-1)' }} src={logo} alt='Logo'></img>
      <p style={{ margin: '0.2em' }}>Tiedustelijan<br></br>----kosto----</p>
      <img style={{ margin: '13px 10px', transform: 'scaleY(-1)' }} src={logo} alt='Logo'></img>
      <img style={{ margin: '13px 10px', transform: 'scale(-1, -1)' }} src={logo} alt='Logo'></img>
      <br></br>
      <button
        onClick={handleClick}
        className='titlescreen-button'>
        Paina ⏎ Enter<br></br>aloittaaksesi pelin
      </button>
      <button
        onClick={handleClick}
        className='titlescreen-button-mobile'
        style={{ marginBottom: '20vh' }}>
        Aloita peli tästä
      </button>
    </div>
  );
}

export default TitleScreen