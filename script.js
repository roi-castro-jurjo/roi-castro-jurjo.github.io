const startButton = document.getElementById("start-button");

startButton.addEventListener("mouseover", () => {
    startButton.src = "assets/images/start-button-1.png";
  });

  startButton.addEventListener("mouseout", () => {
    startButton.src = "assets/images/start-button-0.png";
  });







function consoleText(words, ids) {
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

// Uso de la función
consoleText(
  ['Roi Castro', 'Web developer'],
  ['title-name', 'subtitle']
);


