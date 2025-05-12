import { useEffect, useState, useCallback } from 'react';
import character from './kuvat/character.png';
import fence from './kuvat/spiderweb.png';
import obstacle from './kuvat/laatikko.png';
import stairs from './kuvat/portaat.png';
import shadow from './kuvat/varjo.png';

function Square({ indicesOfShadows, value, index, onSquareClick, characterNearGoal, spotlight }) {

  const [flip, setFlip] = useState('');

  const getBgc = () => {
    if (value === character || value === 'moveRadius') {
      return 'rgba(217, 255, 0, 0.7)';
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
      return '0.3';
    } else {
      return '0.10';
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
    if (indicesOfShadows[index] == "south") {
      return 'scale(-1, -1)';
    } else {
      return 'scaleX(1)';
    }
  }

  function fullShadow() {
    if (indicesOfShadows[index] == "southwest") {
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
      {/* <div style={{ display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', outline: 'solid 1px darkred' }}>
        <span>{index}</span>
      </div> */}
      {(value === character) && (
        <img src={value} alt="content" style={{ right: '8px', transform: flip }} className="square-image" />
      )}
      {(value === fence) && (
        <img src={value} alt="content" style={{ right: '0' }} className="square-image" />
      )}
      {(value === stairs || value === obstacle) && (
        <img src={value} alt="content" style={{ opacity: '0.5', right: '0' }} className="square-image" />
      )}
      {indicesOfShadows && indicesOfShadows[index] && (indicesOfShadows[index] === "south" || indicesOfShadows[index] === "west") && (
        <img src={shadow} alt="content" style={{ opacity: shadowOnOff(), right: '0', transform: spinShadow() }} className="square-image" />
      )}
      {indicesOfShadows && indicesOfShadows[index] && indicesOfShadows[index] === "southwest" && (
        <div style={{ height: '50px', width: '50px', backgroundColor: fullShadow(), opacity: shadowOnOff() }} className="square-image" />
      )}

    </div>
  );
}

export default Square