const startButton = document.getElementById("start-button");

startButton.addEventListener("mouseover", () => {
  startButton.src = "assets/images/start-button-1.png";
});

startButton.addEventListener("mouseout", () => {
  startButton.src = "assets/images/start-button-0.png";
});

startButton.addEventListener("touchstart", () =>{
  startButton.src = "assets/images/start-button-1.png";
  setTimeout(() => {
    startButton.src = "assets/images/start-button-0.png";
  }, 250);
});








function writeText(words, ids) {
  let currentIndex = 0; // Índice para controlar el elemento actual

  function animateText() {
    let target = document.getElementById(ids[currentIndex]);
    let letterCount = 0;

    function animateLetters() {
      if (letterCount === words[currentIndex].length) {
        target.innerHTML = target.innerHTML.slice(0,-1)
        // Si ya se mostraron todas las letras, avanzamos al siguiente elemento
        currentIndex += 1;
        if (currentIndex < ids.length) {
          setTimeout(animateText, 100); 
        }
        return;
      }

      target.innerHTML = words[currentIndex].substring(0, letterCount + 1) + "█";
      letterCount += 1;

      // Llamamos recursivamente la función para mostrar la siguiente letra
      setTimeout(animateLetters, 100);
    }

    animateLetters(); // Iniciamos la animación para el elemento actual
  }

  // Iniciamos la animación sobre el primer elemento al cargar la página
  document.addEventListener('DOMContentLoaded', function () {
    animateText();
  });

  
}

writeText(
  ['Roi Castro', 'Web developer'],
  ['title-name', 'subtitle']
);

function adjustMinHeightToZero(element) {
    if (!element) return; 

    
    element.style.minHeight = '0';

    
    const children = element.children;

    
    for (let i = 0; i < children.length; i++) {
        adjustMinHeightToZero(children[i]);
    }
}

function resetScreen() {
  setTimeout(function() {
    let screen = document.getElementById("screen-container");
    if (screen) {
      screen.remove();
    }
    window.location.href = 'cube.html';
  }, 1000);
}


function turnOffTV() {
  let screen = document.getElementsByClassName("screen")[0];
  adjustMinHeightToZero(screen)
  screen.classList.toggle("off")
  resetScreen()
  
}

document.getElementById("start-button").addEventListener("click", turnOffTV)