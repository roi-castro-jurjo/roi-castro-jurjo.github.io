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
  var currentIndex = 0; // Índice para controlar el elemento actual

  function animateText() {
    var target = document.getElementById(ids[currentIndex]);
    var letterCount = 0;

    function animateLetters() {
      if (letterCount === words[currentIndex].length) {
        target.innerHTML = target.innerHTML.slice(0,-1)
        // Si ya se mostraron todas las letras, avanzamos al siguiente elemento
        currentIndex += 1;
        if (currentIndex < ids.length) {
          setTimeout(animateText, 1000); // Esperamos 1 segundo antes de iniciar la siguiente animación
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
    if (!element) return; // If the element is null or undefined, stop the recursion

    // Set the min-height of the current element to 0
    element.style.minHeight = '0';

    // Get all child nodes of the current element
    const children = element.children;

    // Recursively adjust min-height for each child element
    for (let i = 0; i < children.length; i++) {
        adjustMinHeightToZero(children[i]);
    }
}

function resetScreen() {
  setTimeout(function() {
    var elemento = document.getElementById("screen-container");
    if (elemento) {
      elemento.remove();
    }
  }, 1000); // 1000 milisegundos (1 segundo)
}


function turnOffTV() {
  let screen = document.getElementsByClassName("screen")[0];
  adjustMinHeightToZero(screen)
  screen.classList.toggle("off")
  resetScreen()
}

document.getElementById("start-button").addEventListener("click", turnOffTV)