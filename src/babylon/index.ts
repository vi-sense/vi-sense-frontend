import App from './App';


const production = true

window.addEventListener('DOMContentLoaded', () => {
	const canvas = <HTMLCanvasElement> document.getElementById('renderCanvas');
	const app = new App(canvas, 1, production);
});
  