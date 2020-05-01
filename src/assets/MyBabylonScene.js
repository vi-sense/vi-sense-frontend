import * as BABYLON from 'babylonjs'
import * as AdmZip from 'adm-zip'
import * as fs from 'fs';
import * as JSZip from 'jszip'

export default class MyScene {

  constructor() { }

  doAction() {



    var Zip = new JSZip()
       console.log(Zip)
       var url = 'http://visense.f4.htw-berlin.de:8080/files/mep-building-model/model.zip/' // Introducing static files

      var xmlhttp = null
      if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        /* eslint-disable no-new */
        xmlhttp = new window.XMLHttpRequest()
      } else { // code for IE6, IE5
        /* eslint-disable no-new */
        xmlhttp = new window.ActiveXObject('Microsoft.XMLHTTP')
      }
      xmlhttp.open('GET', url, true)
      xmlhttp.withCredentials = true

      // recent browsers
      if ('responseType' in xmlhttp) {
        xmlhttp.responseType = 'arraybuffer'
      }

      // older browser
      if (xmlhttp.overrideMimeType) {
        xmlhttp.overrideMimeType('text/plain; charset=x-user-defined')
      }
      xmlhttp.send()
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          var file = xmlhttp.response || xmlhttp.responseText

          JSZip.loadAsync(file).then(function (zip) {
            console.log(zip)
          })
        }
      }
    
  




    console.log(5 + 6);

  }
}