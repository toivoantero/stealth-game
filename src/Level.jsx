import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Square from './Square';
import './styles.css'
import character from './character.png';
import spiderweb from './spiderweb.png';
import obstacle from './laatikko.png';
import stairs from './portaat.png';
import lamp from './lamppu.png'
import lamp_bg from './lamppu_tausta.png'
import EndScreen from './EndScreen';

// Eri kentät voisi tehdä joko niin, että jokaisella on oma funktio ja tiedosto, 
// tai että samaan Level-funktioon tuodaan erilaiset kenttämääreet Json-objektina.
function Level() {
  const light = 'rgba(255,255,190,1';
  const levelSize = 10;
  const startSquare = 51;
  const goalSquare = 48;
  const obstacleLocations = [33, 52, 65];
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
      ...Array.from({ length: 2 }, (_, i) => obstacleLocations[2] + i)
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

    // Jos pelihahmo pääsee maaliin, niin meneillään oleva taso loppuu, ja nakymä siirtyy 
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

  // Valokeila välillä näkyy, ja välillä ei
  /*function spotlightOnOff() {
    //let light = 'rgba(255,255,111,0.8)';
    if (spotlight == null) {
      setSpotlight(light);
    } else if (spotlight == light) {
      setSpotlight(null);
    }
  }*/

  function spotlightOnOff() {
    setSpotlight(prevSpotlight => {
      const newSpotlight = [null, null, null, null];
      newSpotlight[currentSpotlightIndex] = light;
      return newSpotlight;
    });
    setCurrentSpotlightIndex(prevIndex => (prevIndex + 1) % 4);
  }

  function reorderSpotlightToDivs() {
    let [firstlight, secondlight, thirdlight, fourthlight] = [0, 1, 2, 3];
    let [firstDiv, secondDiv, thirdDiv, fourthDiv] = [thirdlight, fourthlight, secondlight, firstlight];
    let order = [firstDiv, secondDiv, thirdDiv, fourthDiv];
    return order;
  }

  function isSafeFromLight(currentLocation, safeFromLight) {
    return safeFromLight.some(item => item.outsideBeamzone.includes(currentLocation)) ||
      safeFromLight.some(item => item.behindObstacle.includes(currentLocation)) ||
      safeFromLight.goalSquare === currentLocation;
  }

  // Tarkistaa osuuko valokeila pelihahmoon ja mikäli osuu, lopettaa pelisuorituksen
  function spotlightOnCharacter() {
    const safeFromLight0 = {
      outsideBeamzone: [
        20, 21, 22, 23, 24, 25, 26, 27,
        30, 31, 32, 33, 34, 35, 36, 37,
        40, 41, 42, 43, 44, 45, 46, 47,
        50, 51, 52, 53, 54, 55, 56, 57,
        60, 61, 62, 63, 64, 65, 66, 67,
        70, 71, 72, 73, 74, 75, 76, 77
      ],
      behindObstacle: [obstacleLocations[0] - 1, obstacleLocations[1] - 1, obstacleLocations[2] - 1],
      goalSquare: goalSquare
    };

    const safeFromLight1 = {
      outsideBeamzone: [28, 29, 38, 39, 48, 49, 58, 59, 68, 69, 78, 79],
      behindObstacle: [obstacleLocations[0] - 1, obstacleLocations[1] - 1, obstacleLocations[2] - 1],
      goalSquare: goalSquare
    };

    if (spotlight[1] === light && !isSafeFromLight(currentLocation, [safeFromLight1])) {
      setGameOver(true);
    }
    if (spotlight[0] === light && !isSafeFromLight(currentLocation, [safeFromLight0])) {
      setGameOver(true);
    }
  }

  function characterNearGoal() {
    if (squares[goalSquare - 1] === character
      || squares[goalSquare - levelSize] === character
      || squares[goalSquare + 1] === character
      || squares[goalSquare + levelSize] === character
    ) {
      return true;
    }
  }

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

  function testi() {
    console.log(currentLocation);
  }

  function indicesOfShadows(index) {
    let indices = [32,51,64,74,75,76];
    if (indices.includes(index)) {
      return indices;
    } else {
      return null;
    }
  }

  function spinSpotlight() {
    if (spotlight[0]) {
      return 'scaleX(-1)';
    } else if (spotlight[1]) {
      return 'scaleX(1)';
    } else if (spotlight[2]) {
      return 'scaleY(-1)';
    } else if (spotlight[3]) {
      return 'scale(-1, -1)';
    }
  }

  return (
    <div className='background'>
      <div className='boardgrid'>
        <div className='superficial-graphics'>
          <div className='spotlight-all'>
            {reorderSpotlightToDivs().map((value, index) => (
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
            indicesOfShadows={indicesOfShadows(index)}
            value={value}
            index={index}
            onSquareClick={() => handleClick(index)}
            characterNearGoal={characterNearGoal()}
            spotlight={spotlight}
          />
        ))}
      </div>
      <div className='superficial-graphics'>
        <div className='spotlight-all'>
          <div className='spotlight-angle'></div>
          <div className='spotlight-angle'>
            <img src={lamp_bg} style={{
              position: 'absolute',
              height: '50px',
              width: '50px',
              translate: '-25px 75px',
              transform: spinSpotlight()
            }} />
            <img src={lamp} style={{
              position: 'absolute',
              opacity: '0.7',
              height: '50px',
              width: '50px',
              translate: '-25px 75px',
              transform: spinSpotlight()
            }} />
          </div>
          <div className='spotlight-angle'></div>
          <div className='spotlight-angle'></div>
        </div>
      </div>
      {(gameOver) && (
        <div className='superficial-graphics'>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: '33px' }}>Hälytys!<br></br>Sinut on löydetty!</p>
            <button onClick={initializeLevel}>Yritä uudestaan</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Level

//div-hässäkän jonka sisällä spottivalo on, voisi pakata funktioon,
//ja hakea aina eri grafiikoille uuden kalvon, ja niitä tarvitsee laittaa päällekkäin.
//samoin kuin squarella oma grafiikan käsittely tiedosto, niin muilla grafiikka-kalvoilla olisi.

//jokaiselle spottivalon suunnalle pitää tehdä omat kytkökset: turva-alueet; eikä voi olla on/off, 
//vaan on jatkuvasti ON, suuntaa vaihdellen, tai sitten jokaisella suunnalla oma on/off.

/*
function spotlightOnCharacter() {
    let safeFromLight = [{
      outsideBeamzone: [28, 29, 38, 39, 48, 49, 58, 59, 68, 69, 78, 79],
      behindObstacle: [obstacleLocations[0] - 1, obstacleLocations[1] - 1, obstacleLocations[2] - 1],
      goalSquare: goalSquare
    }];
    if (spotlight[1] === light) {
      if (
        safeFromLight.some(item => item.outsideBeamzone.includes(currentLocation))
        || safeFromLight.some(item => item.behindObstacle.includes(currentLocation))
        || safeFromLight.goalSquare === goalSquare
      ) {
        return false;
      } else {
        setGameOver(true);
      }
    }
  }
    */