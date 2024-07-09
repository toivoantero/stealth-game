import { useEffect, useState, useCallback } from 'react';
import character from './character.png';
import fence from './spiderweb.png';
import obstacle from './laatikko.png';
import stairs from './portaat.png';
import shadow from './varjo.png';

function Square({ indicesOfShadows, value, index, onSquareClick, characterNearGoal, spotlight }) {

  const [flip, setFlip] = useState('');

  const getBgc = () => {
    if (value === character || value === 'moveRadius') {
      return 'rgba(255,255,0,0.7)';
    } else if (value === fence) {
      return 'rgba(111,222,222,0.7';
    } else if (value === obstacle) {
      return 'rgba(150,200,200,0.7';
    } else if (value === stairs && characterNearGoal) {
      return 'rgba(255,255,0,0.7';
    } else if (value === stairs && !characterNearGoal) {
      return 'rgba(50,150,80,0.6';
    }
  };

  const shadowOnOff = () => {
    if (spotlight[1]) {
      return '0.5';
    } else {
      return '0.15';
    }
  };

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'ArrowLeft') {
      setFlip('scaleX(-1)');
    } else if (event.key === 'ArrowRight') {
      setFlip('scaleX(1)');
    }
  }, [flip]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  function spinShadow() {
    if (indicesOfShadows[5] == index) {
      return 'scale(-1, -1)';
    } else if (indicesOfShadows[3] == index) {
      return 'scaleY(-1)';
    } else {
      return 'scaleX(1)';
    }
  }

  function fullShadow() {
    if (indicesOfShadows[4] == index) {
      return 'black';
    } else {
      return 'initial';
    }
  }

  return (
    <div
      className="square"
      onClick={onSquareClick}
      style={{ backgroundColor: getBgc() }}
    >
      {(value === character) && (
        <img src={value} alt="content" style={{ right: '8px', transform: flip }} className="square-image" />
      )}
      {(value === fence) && (
        <img src={value} alt="content" style={{ right: '0' }} className="square-image" />
      )}
      {(value === stairs || value === obstacle) && (
        <img src={value} alt="content" style={{ opacity: '0.5', right: '0' }} className="square-image" />
      )}
      {(indicesOfShadows) && (index !== 75) && (
        <img src={shadow} alt="content" style={{ backgroundColor: fullShadow(), opacity: shadowOnOff(), right: '0', transform: spinShadow() }} className="square-image" />
      )}
      {(index == 74) && (
        <div style={{ height: '50px', width: '50px', backgroundColor: fullShadow(), opacity: shadowOnOff() }} className="square-image" />
      )}
      
    </div>
  );
}

export default Square