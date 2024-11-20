import { ControllerMapping, buttonSvgClasses, controllerMappings } from "./controller-mappings";
import { SvgService } from "./services/svg.service";

const controllerDisplay = document.getElementById('controller-display')!;
const controllerName = document.getElementById('controller-name')!;

let currentController: ControllerMapping | null = null;

function detectController(gamepad: Gamepad): void {    
    if (gamepad.id.includes('Xbox')) {
        currentController = controllerMappings['Xbox'];
    } else if (gamepad.id.includes('PLAYSTATION(R)3')) {
        currentController = controllerMappings['PS3'];
    } else if (gamepad.id.includes('Wireless Controller')) {
        currentController = controllerMappings['PS4'];
    } else if (gamepad.id.includes('DualSense Wireless Controller')) {
        currentController = controllerMappings['PS5'];
    } else if (gamepad.id.includes('Joy-Con (L)')) {
        currentController = controllerMappings['JoyConL'];
    } else if (gamepad.id.includes('Joy-Con (R)')) {
        currentController = controllerMappings['JoyConR'];
    } else if (gamepad.id.includes('Joy-Con L+R')) {
        currentController = controllerMappings['JoyConLR'];
    } else currentController = null;

    if (currentController) {
        controllerName.textContent = currentController.name;
        renderControllerDisplay(currentController);
    } else controllerName.textContent = 'Unknown Controller'; 
}

async function renderControllerDisplay(controller: ControllerMapping): Promise<void> {
    controllerDisplay.innerHTML = '';

    // buttons
    controller.buttons.forEach(button => {
        const labelElement = document.createElement('label');
        labelElement.className = 'controller-button';
        labelElement.id = button;
        labelElement.textContent = button;
        controllerDisplay.appendChild(labelElement);
    });

    // axes
    controller.axes.forEach(axis => {        
        const axisElement = document.createElement('div');
        axisElement.className = 'controller-axis';
        axisElement.id = axis;
        axisElement.textContent = axis;
        controllerDisplay.appendChild(axisElement);
    });

    // svg
    if (controller.svg) {
        const svgElement = await SvgService.getByUrl(`./assets/svg/${controller.svg}`);
        const svgContainer = document.querySelector('.svg-container');
        if (svgContainer && svgElement) {
            svgContainer.innerHTML = '';
            svgContainer.appendChild(svgElement);
        }
    }
}

function triggerImageButton(button: string) {
    document.querySelector(`.button.${buttonSvgClasses[button]}`)?.classList.add('active');
}

function releaseImageButton(button: string) {
    document.querySelector(`.button.${buttonSvgClasses[button]}`)?.classList.remove('active');
}

function updateControllerState(gamepad: Gamepad): void {    
    if (!currentController) return;

    currentController.buttons.forEach((button, index) => {
        const buttonElement = document.getElementById(button);
        if (buttonElement) {
            // THIS IS WHERE THE MAGIC HAPPENS
            if (gamepad.buttons[index].pressed) {
                triggerImageButton(button);
                buttonElement.classList.add('button-pressed');
            } else {
                releaseImageButton(button);
                buttonElement.classList.remove('button-pressed');
            }
        }
    });

    currentController.axes.forEach((axis, index) => {
        const axisElement = document.getElementById(axis);
        if (axisElement) {
            axisElement.textContent = `${axis}: ${gamepad.axes[index].toFixed(2)}`;
        }

        // we need them in pairs
        if(index % 2 === 0) {
            const x = gamepad.axes[index];
            const y = gamepad.axes[index + 1];
            const stick = document.querySelector(`.${buttonSvgClasses[axis]}`) as HTMLElement;
            if(stick) {
                stick.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
            }
        }
        // set translate x and y pairs for each stick. Array values come in pairs, first the first 2 then the other 2 and so on

        
    });    
}

let lastTimestamp = 0;

function gameLoop(t: number): void {
    const FPS: number = 30;

    if ((t - lastTimestamp) < (1000 / FPS)) {
        requestAnimationFrame(gameLoop);
        return;
    }

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads.find((gamepad) => !!gamepad);    

    if (gamepad) {
        if (!currentController) detectController(gamepad);
        updateControllerState(gamepad);        
    }

    lastTimestamp = t;
    requestAnimationFrame(gameLoop);
}

function initVibration(gamepad: Gamepad): void {
    const vibrationActuator = gamepad.vibrationActuator;
    if(!vibrationActuator) return;
    vibrate(100);
    const existedVibrateButton = document.querySelector('.vibrate-button');
    if(existedVibrateButton) existedVibrateButton.remove();
    const vibrateButton = document.createElement('button');
    vibrateButton.className = 'vibrate-button';
    vibrateButton.textContent = 'Vibrate';
    document.body.appendChild(vibrateButton);
    vibrateButton.addEventListener('click', () => vibrate(100));
}

function vibrate(duration: number = 100, magnitude = 1): void {
    if(!currentController) return;
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads.find((gamepad) => !!gamepad);

    if (gamepad && gamepad.vibrationActuator) {
        const vibrationActuator = gamepad.vibrationActuator;
        vibrationActuator?.playEffect('dual-rumble', {
            duration,
            strongMagnitude: magnitude,
            weakMagnitude: magnitude
        });
    }
}

function start(event: GamepadEvent): void {
    if(!event.gamepad) return;
    console.log('Gamepad connected:', event.gamepad);
    detectController(event.gamepad);
    if(event.gamepad.vibrationActuator) initVibration(event.gamepad);
    requestAnimationFrame(gameLoop);
}

function stop(): void {
    currentController = null;
    resetDOM();
}

function resetDOM(): void {
    controllerName.textContent = 'No controller connected';
    controllerDisplay.innerHTML = '';
    document.querySelector('.svg-container').innerHTML = '';
    document.querySelector('.vibrate-button')?.remove();
}

window.addEventListener('gamepadconnected', start);
window.addEventListener('gamepaddisconnected', stop);
window.addEventListener('beforeunload', stop);
window.addEventListener('unload', stop);