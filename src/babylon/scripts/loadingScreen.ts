interface ILoadingScreen {
  //What happens when loading starts
  displayLoadingUI: () => void;
  //What happens when loading stops
  hideLoadingUI: () => void;
  //default loader support. Optional!
  loadingUIBackgroundColor: string;
  loadingUIText: string;
}

export default class CustomLoadingScreen implements ILoadingScreen {
  //optional, but needed due to interface definitions
  public loadingUIBackgroundColor: string;
  public loadingUIText: string;

  //actual loadingScreen that is appended
  private _loadingDiv: HTMLDivElement;

  /***
     * @param _renderingCanvas defines the canvas used to render the scene
     * @param _loadingText defines the default text to display
     */
  constructor(private _renderingCanvas: HTMLCanvasElement, private _loadingText: string) { }

  // css loader by https://loading.io/css/
  public displayLoadingUI() {
    if (document.getElementById("loadingScreen")) {
      document.getElementById("loadingScreen").style.display = "initial";
      document.getElementById("loadingScreen").style.opacity = "1";
      return;
    }
    this._loadingDiv = document.createElement("div");
    this._loadingDiv.id = "loadingScreen";
    this._loadingDiv.innerHTML = `
      <div class='container'>
        <div class='lds-ellipsis'><div></div><div></div><div></div><div></div></div>
        <h2 id="progressText">`+this._loadingText+`</h2>
        <div class="meter">
          <span id="progressBar" style="width: 0%"></span>
        </div>
      </div>`;
    var loadingScreenCss = document.createElement('style');
    loadingScreenCss.type = 'text/css';
    loadingScreenCss.innerHTML = `
        .container {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        #loadingScreen {
          vertical-align: middle;
          display: block;
          background-color: white;
          margin: auto auto;
          transition: opacity .6s ease;
        }
        #loadingScreen h2 {
          font-family: 'Helvetica', sans-serif;
          color: black;
        }

        .meter {
          width: 50%;
        	height: 20px;
        	position: relative;
        	background: #000000;
        	-moz-border-radius: 5px;
        	-webkit-border-radius: 5px;
        	border-radius: 5px;
        	padding: 2px;
        }

        .meter > span {
          font-family: 'Helvetica', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          border-radius: 2px;
          color: white;
          background-color: rgb(43,194,83);
          position: relative;
          overflow: hidden;
        }


        .lds-ellipsis {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
        }
          .lds-ellipsis div {
          position: absolute;
          top: 33px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #000;
          animation-timing-function: cubic-bezier(0, 1, 1, 0);
        }
        .lds-ellipsis div:nth-child(1) {
          left: 8px;
          animation: lds-ellipsis1 0.6s infinite;
        }
        .lds-ellipsis div:nth-child(2) {
          left: 8px;
          animation: lds-ellipsis2 0.6s infinite;
        }
        .lds-ellipsis div:nth-child(3) {
          left: 32px;
          animation: lds-ellipsis2 0.6s infinite;
        }
        .lds-ellipsis div:nth-child(4) {
          left: 56px;
          animation: lds-ellipsis3 0.6s infinite;
        }
        @keyframes lds-ellipsis1 {
          0% {
            transform: scale(0);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes lds-ellipsis3 {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(0);
          }
        }
        @keyframes lds-ellipsis2 {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(24px, 0);
          }
        }
      `;
    document.getElementsByTagName('head')[0].appendChild(loadingScreenCss);
    this._resizeLoadingUI();
    window.addEventListener("resize", this._resizeLoadingUI);
    document.body.appendChild(this._loadingDiv);
  }

  public hideLoadingUI() {
    document.getElementById("loadingScreen").style.opacity = "0";
    setTimeout(function() {
      document.getElementById("loadingScreen").style.display = "none";
    }, 1000);
  }

  // taken from the DefaultLoadingScreen
  private _resizeLoadingUI = () => {
    var canvasRect = this._renderingCanvas.getBoundingClientRect();
    var canvasPositioning = window.getComputedStyle(this._renderingCanvas).position;

    if (!this._loadingDiv) {
      return;
    }

    this._loadingDiv.style.position = (canvasPositioning === "fixed") ? "fixed" : "absolute";
    this._loadingDiv.style.left = canvasRect.left + "px";
    this._loadingDiv.style.top = canvasRect.top + "px";
    this._loadingDiv.style.width = canvasRect.width + "px";
    this._loadingDiv.style.height = canvasRect.height + "px";
  }
}
