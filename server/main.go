package main

import (
	"github.com/adrianosela/certcache"
	"golang.org/x/crypto/acme/autocert"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
	"github.com/adrianosela/sslmgr"
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
	ss, err := sslmgr.NewServer(sslmgr.ServerConfig{
		Hostnames: []string{"visense.f4.htw-berlin.de"},
		HTTPPort:  ":" + os.Getenv("PORT"),
		HTTPSPort: ":" + os.Getenv("HTTPS_PORT"),
		Handler:   http.FileServer(fs),
		ServeSSLFunc: func() bool {
			return strings.ToLower(os.Getenv("PROD")) == "true"
		},
		CertCache: certcache.NewLayered(
			certcache.NewLogger(),
			autocert.DirCache("/certcache"),
		),
		ReadTimeout:         5 * time.Second,
		WriteTimeout:        5 * time.Second,
		IdleTimeout:         25 * time.Second,
		GracefulnessTimeout: 5 * time.Second,
		GracefulShutdownErrHandler: func(e error) {
			log.Fatal(e)
		},
	})

	if err != nil {
		panic(err)
	}

	ss.ListenAndServe()
}