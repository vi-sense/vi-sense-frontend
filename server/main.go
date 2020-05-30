package main

import (
	"net/http"
	"os"
)

type defaultFileDir struct {
    http.Dir
}

//wrapper around the Dir Open method, that opens index.html if the requested file was not found.
func (fs defaultFileDir) Open(name string) (http.File, error){
	file, err := fs.Dir.Open(name)
	if err!=nil { //if file was not found, open index.html, this might be needed by vue router
		file, err := fs.Dir.Open("index.html")
		if err != nil {
			return nil, err
		}
		return file, err
	}
	return file, err
}

func redirectTLS(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "https://visense.f4.htw-berlin.de:443"+r.RequestURI, http.StatusMovedPermanently)
}

func main() {
	// Simple static webserver:
	fs := defaultFileDir{http.Dir(os.Getenv("STATIC_DIR"))}

	go func(){
		err := http.ListenAndServe(":" + os.Getenv("HTTP_PORT"), http.HandlerFunc(redirectTLS))
		if err != nil {
			panic(err)
		}
	}()

	errHttps := http.ListenAndServeTLS(":" + os.Getenv("HTTPS_PORT"), "/certs/live/visense.f4.htw-berlin.de/fullchain.pem", "/certs/live/visense.f4.htw-berlin.de/privkey.pem", http.FileServer(fs))
	if errHttps != nil {
		panic(errHttps)
	}
}