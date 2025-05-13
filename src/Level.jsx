import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Square from './Square';
import './styles.css'
import character from './kuvat/character.png';
import spiderweb from './kuvat/spiderweb.png';
import obstacle from './kuvat/laatikko.png';
import stairs from './kuvat/portaat.png';
import lamp from './kuvat/lamppu.png'
import lamp_bg from './kuvat/lamppu_tausta.png'
import EndScreen from './EndScreen';

// Eri kentät voisi tehdä niin, että samaan Level-funktioon tuodaan erilaiset kenttämääreet Json-objektina.
function Level() {
  const light = 'rgba(255,255,190,1';
  const levelSize = 10;
  const startSquare = 51;
  const goalSquare = 48;
  const obstacleLocations = [33, 52, 65, 66];
  const shadowLocations = {
    32: "west",
    51: "west",
    64: "west",
    74: "southwest",
    75: "southwest",
    76: "south"
  };
  const lampLocation = { upLeft: 17, upRight: 18, downLeft: 27, downRight: 28 };
  const [squares, setSquares] = useState(Array(levelSize * levelSize).fill(null));
  const [currentLocation, setCurrentLocation] = useState(null);
  const [spotlight, setSpotlight] = useState([null, light, null, null]);
  const [gameOver, setGameOver] = useState(false);
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0);
  let navigateTo = useNavigate();

  const handleKeyPress = useCallback((event) => {
    if (gameOver) return;
    let nextLocation;
    if (event.key === 'ArrowUp') {
      nextLocation = currentLocation - levelSize;
    } else if (event.key === 'ArrowDown') {
      nextLocation = currentLocation + levelSize;
    } else if (event.key === 'ArrowLeft') {
      nextLocation = currentLocation - 1;
    } else if (event.key === 'ArrowRight') {
      nextLocation = currentLocation + 1;
    }
    updateLevel(nextLocation);
  }, [gameOver, currentLocation]);

  function handleClick(input) {
    if (gameOver) return; // Pysäytä liikkeet, jos peli on päättynyt
    updateLevel(input);
  }

  // Pelilaudan alustus
  function initializeLevel() {
    let initialSquares = Array(levelSize * levelSize).fill(null);

    // Asetetetaan verkot ja esteet
    const indicesSpiderweb = [
      ...Array.from({ length: 20 }, (_, i) => i),
      ...Array.from({ length: 20 }, (_, i) => 80 + i)
    ];
    indicesSpiderweb.forEach(index => {
      initialSquares[index] = spiderweb;
    });

    const indicesObstacle = [
      ...Array.from({ length: 1 }, (_, i) => obstacleLocations[0] + i),
      ...Array.from({ length: 1 }, (_, i) => obstacleLocations[1] + i),
      ...Array.from({ length: 1 }, (_, i) => obstacleLocations[2] + i),
      ...Array.from({ length: 1 }, (_, i) => obstacleLocations[3] + i)
    ];
    indicesObstacle.forEach(index => {
      initialSquares[index] = obstacle;
    });

    // Merkkaa hahmon liikkumavaran
    paintRadius(initialSquares, startSquare);

    // Asetetaan maali- ja lähtöruudut
    initialSquares[goalSquare] = stairs;
    initialSquares[startSquare] = character;

    setSquares(initialSquares);
    setCurrentLocation(startSquare);
    setCurrentSpotlightIndex(0);
    setSpotlight([null, null, null, null]);
    setGameOver(false);
  }

  // Päivittää pelilaudan sisällön, vaikkapa hahmon sijainnin
  function updateLevel(nextLocation) {
    if (gameOver) return; // Pysäytä liikkeet, jos peli on päättynyt
    let nextSquares = squares.slice().map(value => value === 'moveRadius' ? null : value);

    // Tarkistaa onko klikatussa kohdassa jokin kappale
    if (squares[nextLocation] === character
      || squares[nextLocation] === spiderweb
      || squares[nextLocation] === obstacle
    ) {
      return;
    }

    // Asettaa mahdolliset siirrot pelihahmolle
    if (currentLocation) {
      let validMoves = [];
      if (currentLocation % levelSize === 0) {
        validMoves = [currentLocation + 1, currentLocation + levelSize, currentLocation - levelSize];
      } else if ((currentLocation + 1) % levelSize === 0) {
        validMoves = [currentLocation - 1, currentLocation + levelSize, currentLocation - levelSize];
      } else {
        validMoves = [currentLocation + 1, currentLocation - 1, currentLocation + levelSize, currentLocation - levelSize];
      }
      if (!validMoves.includes(nextLocation)) {
        return;
      }
    }

    paintRadius(nextSquares, nextLocation);

    // Asettaa pelilaudan ruuduille pelihahmon
    nextSquares[nextLocation] = character;
    setSquares(nextSquares);
    setCurrentLocation(nextLocation);

    // Jos pelihahmo pääsee maaliin, niin meneillään oleva taso loppuu, ja näkymä siirtyy 
    if (nextLocation === goalSquare) {
      navigateTo('/endscreen');
    }
  }

  // Merkkaa hahmon liikkumavaran eli mahdolliset siirrot
  function paintRadius(nextSquares, nextLocation) {
    // Valitsee pelihahmon sijaintia ympäröivät ruudut niiden merkkaamista varten
    let neighbourIndices = [];
    if (nextLocation % levelSize === 0) {
      neighbourIndices = [nextLocation + 1, nextLocation + levelSize, nextLocation - levelSize];
    } else if ((nextLocation + 1) % levelSize === 0) {
      neighbourIndices = [nextLocation - 1, nextLocation + levelSize, nextLocation - levelSize];
    } else {
      neighbourIndices = [nextLocation + 1, nextLocation - 1, nextLocation + levelSize, nextLocation - levelSize];
    }

    // Merkkaa hahmon mahdolliset siirrot pelilaudalle
    neighbourIndices.forEach(neighbour => {
      if (neighbour >= 0
        && neighbour < squares.length
        && squares[neighbour] !== spiderweb
        && squares[neighbour] !== obstacle
        && squares[neighbour] !== stairs
        && nextSquares[neighbour] !== spiderweb
        && nextSquares[neighbour] !== obstacle
        && nextSquares[neighbour] !== stairs) {
        nextSquares[neighbour] = 'moveRadius';
      }
    });
  }

  // Tarkistaa osuuko valokeila pelihahmoon ja mikäli osuu, lopettaa pelisuorituksen
  function spotlightOnCharacter() {
    let lightedAreaWhole = Array.from(
      { length: levelSize * levelSize },
      (_, index) => index)
      .filter(value => value >= 20)
      .filter(value => value <= 79);
    let lightedAreaLeft;
    let lightedAreaRight;

    if (lampLocation.downLeft % 10 >= 0) {
      const excludeNumbers = Array.from(
        { length: 10 - (lampLocation.downLeft % 10) - 1 },
        (_, i) => lampLocation.downLeft % 10 + 1 + i
      );
      lightedAreaLeft = lightedAreaWhole.filter((value) => !excludeNumbers.includes(value % 10));
    }

    if (lampLocation.downRight % 10 >= 1) {
      const excludeNumbers = Array.from(
        { length: lampLocation.downRight % 10 },
        (_, i) => i
      );
      lightedAreaRight = lightedAreaWhole.filter((value) => !excludeNumbers.includes(value % 10));
    }

    const safeFromLight = [
      {
        outsideBeamzone: lightedAreaLeft,
        behindObstacle: shadowLocations,
        goalSquare: goalSquare
      },
      {
        outsideBeamzone: lightedAreaRight,
        behindObstacle: shadowLocations,
        goalSquare: goalSquare
      }
    ];

    safeFromLight.forEach((config, index) => {
      if (
        spotlight[index] === light &&
        !(
          config.outsideBeamzone.includes(currentLocation) ||
          currentLocation in config.behindObstacle ||
          config.goalSquare === currentLocation
        )
      ) {
        setGameOver(true);
      }
    });
  }

  function spotlightOnOff() {
    setSpotlight(prevSpotlight => {
      const newSpotlight = [null, null, null, null];
      newSpotlight[currentSpotlightIndex] = light;
      return newSpotlight;
    });
    setCurrentSpotlightIndex(prevIndex => (prevIndex + 1) % 4);
  }

  const graphicsManager = {
    reorderSpotlightToDivs: () => {
      let [firstlight, secondlight, thirdlight, fourthlight] = [0, 1, 2, 3];
      let [firstDiv, secondDiv, thirdDiv, fourthDiv] = [thirdlight, fourthlight, secondlight, firstlight];
      return [firstDiv, secondDiv, thirdDiv, fourthDiv];
    },

    spinSpotlight: () => {
      if (spotlight[0]) {
        return 'scaleX(-1)';
      } else if (spotlight[1]) {
        return 'scaleX(1)';
      } else if (spotlight[2]) {
        return 'scaleY(-1)';
      } else if (spotlight[3]) {
        return 'scale(-1, -1)';
      } else {
        return 'scaleX(-1)';
      }
    },

    indicesOfShadows: (index) => {
      let indices = shadowLocations;
      return index in indices ? indices : null;
    },

    characterNearGoal: () => {
      return (
        squares[goalSquare - 1] === character ||
        squares[goalSquare - levelSize] === character ||
        squares[goalSquare + 1] === character ||
        squares[goalSquare + levelSize] === character
      );
    }
  };
  /*
  useEffect-käynnistäjät 
  tästä alaspäin
  */

  useEffect(() => {
    spotlightOnCharacter();
  }, [spotlight, squares]);

  // Määrittää valokeilan näkymisen aikamääreet, eli miten kauan se näkyy
  useEffect(() => {
    if (!gameOver) {

      const timeout = setInterval(() => {
        spotlightOnOff();
        console.log(spotlight);
      }, 3000);
      return () => clearInterval(timeout);
    }
  }, [currentSpotlightIndex, gameOver]);

  useEffect(() => {
    initializeLevel();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress, gameOver]);

  return (
    <div className='background'>
      <div className='boardgrid'>
        <div className='superficial-graphics'>
          <div className='spotlight-all'>
            {graphicsManager.reorderSpotlightToDivs().map((value, index) => (
              <div
                key={index}
                className='spotlight-angle'
                style={{ backgroundColor: spotlight[value] ? spotlight[value] : null }}
              >
              </div>
            ))}
          </div>
        </div>
        {squares.map((value, index) => (
          <Square
            key={index}
            indicesOfShadows={graphicsManager.indicesOfShadows(index)}
            value={value}
            index={index}
            onSquareClick={() => handleClick(index)}
            characterNearGoal={graphicsManager.characterNearGoal()}
            spotlight={spotlight}
          />
        ))}
      </div>
      <div className='superficial-graphics'>
        <div className='spotlight-all'>
          <div className='spotlight-angle'></div>
          <div className='spotlight-angle'>
            {/* Tämä lamp_bg johtuu vain siitä, etten ole vielä viitsinyt
            korjata lampun png-kuvaa oikeaan sävyyn...  */}
            <img src={lamp_bg} style={{
              position: 'absolute',
              height: '50px',
              width: '50px',
              translate: '-25px 75px',
              transform: graphicsManager.spinSpotlight()
            }} />
            <img src={lamp} style={{
              position: 'absolute',
              opacity: '0.7',
              height: '50px',
              width: '50px',
              translate: '-25px 75px',
              transform: graphicsManager.spinSpotlight()
            }} />
          </div>
          <div className='spotlight-angle'></div>
          <div className='spotlight-angle'></div>
        </div>
      </div>
      {(gameOver) && (
        <div className='superficial-graphics'>
          <div style={{
            backgroundColor: 'rgba(222,55,55,0.6)',
            textAlign: 'center',
            lineHeight: '1.5',
            padding: '20px 20px 40px 20px'
          }}>
            <p className='press-start-2p-regular'
              style={{ fontSize: '20px', color: 'white', textAlign: 'center' }}>
              Hälytys!<br></br>Sinut on löydetty!
            </p>
            <button
              onClick={initializeLevel}
              className='press-start-2p-regular'
              style={{
                fontSize: '13px',
                backgroundColor: 'rgba(255, 255, 255, 0)',
                color: 'white',
                border: '3px solid white',
                display: 'inline-block',
                padding: '20px',
                cursor: 'pointer',
                boxShadow: '7px 7px rgb(255, 255, 255)',
              }}>Yritä uudestaan</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Level