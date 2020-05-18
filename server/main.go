package main

import (
	"log"
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
func main() {
	// Simple static webserver:
	fs := defaultFileDir{http.Dir(os.Getenv("STATIC_DIR"))}
	err := http.ListenAndServeTLS(":" + os.Getenv("PORT"), "/certs/live/visense.f4.htw-berlin.de/fullchain.pem", "/certs/live/visense.f4.htw-berlin.de/privkey.pem", http.FileServer(fs)) //try to serve https
	if err != nil {
		log.Fatal(http.ListenAndServe(":"+os.Getenv("PORT"), http.FileServer(fs))) //try to serve http
	}
}