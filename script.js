const startButton = document.getElementById("start-button");

startButton.addEventListener("mouseover", () => {
    startButton.src = "assets/images/start-button-1.png";
  });

  startButton.addEventListener("mouseout", () => {
    startButton.src = "assets/images/start-button-0.png";
  });