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
    <div className='titlescreen'>
      <span style={{ fontSize: '60px', padding: '0 10px' }}>&#9698;</span>
      <span style={{ fontSize: '60px', padding: '0 10px' }}>&#9699;</span>
      <p style={{ margin: '0.2em' }}>Tiedustelijan<br></br>----kosto----</p>
      <span style={{ fontSize: '60px', padding: '0 10px' }}>&#9701;</span>
      <span style={{ fontSize: '60px', padding: '0 10px' }}>&#9700;</span>
      <br></br>
      <button
        onClick={handleClick}
        className='titlescreen-button'>
        Paina ⏎ Enter<br></br>aloittaaksesi pelin</button>
      <button
        onClick={handleClick}
        className='titlescreen-button-mobile'>
        Aloita peli tästä</button>
    </div>
  );
}

export default TitleScreen