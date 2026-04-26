const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Se muestra el menú, boton de iniciar, el puntaje y las vidas del jugador
const menu = document.getElementById('menu');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');
const hud = document.getElementById('hud');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const menuTitle = document.getElementById('menu-title');

// Se definen las variables del juego que se usan
let animacionId;
let jugando = false;
let pause = false;
let puntos = 0;
let vidas = 3;
let frameCount = 0;

// Cargar Imágenes
const jugadorImg = new Image();
jugadorImg.src = 'img/panda.png';

const cocodriloImg = new Image();
cocodriloImg.src = 'img/cocodrilo.png';

// Boton de inicio para volver al menú principal

homeBtn.addEventListener('click', () => {
    jugando = false;
    pause = false; // Quita la pausa si la había
    cancelAnimationFrame(animacionId);
    
    hud.style.display = 'none';
    menu.style.display = 'flex';
    menuTitle.innerText = 'El Río Peligroso';
    startBtn.innerText = 'Jugar';
});

// Botón de Reinicio
restartBtn.addEventListener('click', () => {
    cancelAnimationFrame(animacionId);
    iniciarJuego();
});

// Verificar si esta en pause el juego
pauseBtn.addEventListener('click', () => {
    if (!jugando) return; // No se puede pausar si no se ha iniciado el juego
    pause = !pause; 
    if (pause) { 
        cancelAnimationFrame(animacionId);
        pauseBtn.innerText = 'Reanudar'; // AL momento de dar pause el boton cambia a reanudar
    } else {
        pauseBtn.innerText = 'Pausar'; // Al momento de dar reanudar el boton cambia a pausar
        actualizarJuego();
    }
});

// Objeto Jugador
const jugador = {
    x: 175, // Posición inicial del jugador que es en el centro del canvas
    y: 500, // Posición del jugardor
    width: 50,
    height: 50,
    velocidad: 5, // Velocidad de movimiento del jugador
    dx: 0 // Velocidad inical no se mueve
};

// Arreglo para almacenar los cocodrilos en el juego
let cocodrilos = [];

// Teclas para mover al jugador a la izquierda o derecha
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') jugador.dx = -jugador.velocidad;
    if (e.key === 'ArrowRight' || e.key === 'd') jugador.dx = jugador.velocidad;
});

// Detiene movimiento cuando se suelta la tecla de izquierda o derecha
document.addEventListener('keyup', (e) => {
    if (
        e.key === 'ArrowLeft' || e.key === 'a' ||
        e.key === 'ArrowRight' || e.key === 'd'
    ) {
        jugador.dx = 0;
    }
});

// Función para generar cocodrilos aleatoriamente
function generarCocodrilos() {
    // Cada segundo aparece un nuevo cocodrilo
    if (frameCount % 60 === 0) {
        let xAleatorio = Math.random() * (canvas.width - 80); // es el ancho del cocodrilo
        cocodrilos.push({
            x: xAleatorio,
            y: -50, // Aparecen arriba fuera del canvas
            width: 80,
            height: 30,
            velocidad: 3 + Math.random() * 2 // Velocidad aleatoria
        });
    }
}

// Bucle principal del juego
function actualizarJuego() {
    if (!jugando) return;
    if (pause) return;

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mover y dibujar al jugador
    jugador.x += jugador.dx;
    // Evitar que salga de los bordes
    if (jugador.x < 0) jugador.x = 0;
    if (jugador.x + jugador.width > canvas.width) jugador.x = canvas.width - jugador.width;
    
    // Dibujar imagen del jugador
    if(jugadorImg.complete) {
        ctx.drawImage(jugadorImg, jugador.x, jugador.y, jugador.width, jugador.height);
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(jugador.x, jugador.y, jugador.width, jugador.height);
    }

    // Mover, dibujar y checar colisiones de cocodrilos
    generarCocodrilos();

    for (let i = 0; i < cocodrilos.length; i++) {
        let croc = cocodrilos[i];
        croc.y += croc.velocidad; // Caen hacia abajo

        // DIseña al cocodrilo
        if(cocodriloImg.complete) {
            ctx.drawImage(cocodriloImg, croc.x, croc.y, croc.width, croc.height);
        } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(croc.x, croc.y, croc.width, croc.height);
        }

        // Detectar colisión entre jugador y cocodrilo cuando se chocan y restar vidas al jugador
        if (
            jugador.x < croc.x + croc.width &&
            jugador.x + jugador.width > croc.x &&
            jugador.y < croc.y + croc.height &&
            jugador.y + jugador.height > croc.y
        ) {
            // Hubo choque
            vidas--;
            livesDisplay.innerText = vidas;
            cocodrilos.splice(i, 1); // Elimina al cocodrilo que chocó con el jugador
            
            if (vidas <= 0) {
                terminarJuego();
            }
        }

        // Sumar puntos si el cocodrilo pasa al jugador sin chocar
        if (croc.y > canvas.height) {
            cocodrilos.splice(i, 1);
            puntos += 10;
            scoreDisplay.innerText = puntos;
            i--; // AL chocar con el cocodrilo se elimina el arreglo asi el cocdrilo desaparece y resta vidas al jugaror
        }
    }
    // Iniciamos con el contador para los cocodrilos y el puntaje que se va sumando cada vez que un cocodrilo pasa sin chocar
    frameCount++;
    animacionId = requestAnimationFrame(actualizarJuego);
}

// Se inicia el juego ocultando el menú
function iniciarJuego() {
    menu.style.display = 'none';
    hud.style.display = 'flex'; // Al mostrar flex, se acomodan puntos a izq y botones a der
    
    jugando = true;
    pause = false; // Nos aseguramos que empiece sin pausa
    puntos = 0;
    vidas = 3;
    cocodrilos = [];
    jugador.x = 175;
    
    scoreDisplay.innerText = puntos;
    livesDisplay.innerText = vidas;
    pauseBtn.innerText = 'Pausar';
    
    frameCount = 0;
    actualizarJuego();
}

// Aquí se termina el juego, mostrando el menú con el puntaje final y la opción de reiniciar
function terminarJuego() {
    jugando = false;
    cancelAnimationFrame(animacionId);
    menu.style.display = 'flex';
    hud.style.display = 'none';
    menuTitle.innerText = `¡Juego Terminado! Puntos: ${puntos}`;
    startBtn.innerText = 'Reiniciar';
}

// Botón Jugar del menú principal
startBtn.addEventListener('click', iniciarJuego);