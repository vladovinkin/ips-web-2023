package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

const (
	port         = ":3000"
	dbDriverName = "mysql"
)

func main() {
	db, err := openDB()
	if err != nil {
		log.Fatal(err)
	}

	dbx := sqlx.NewDb(db, dbDriverName)

	mux := mux.NewRouter()
	mux.HandleFunc("/home", index(dbx))
	mux.HandleFunc("/admin", admin(dbx))
	mux.HandleFunc("/login", login(dbx))
	mux.HandleFunc("/post/{postURL}", post(dbx))

	mux.HandleFunc("/api/post", createPost(dbx)).Methods(http.MethodPost)

	mux.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	fmt.Println("Start server")
	http.ListenAndServe(port, mux)

	if err != nil {
		log.Fatal(err)
	}
}

func openDB() (*sql.DB, error) {

	return sql.Open("mysql", "root:qAz321_mKL@tcp(localhost:3306)/blog?charset=utf8mb4&collation=utf8mb4_unicode_ci&parseTime=true")

}
