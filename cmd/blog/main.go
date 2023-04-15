package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql" // Импортируем для возможности подключения к MySQL
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

	mux := http.NewServeMux()
	mux.HandleFunc("/home", index(dbx))
	mux.HandleFunc("/post", post(dbx))

	// Отдача статического контента из папки static
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	fmt.Println("Start server")
	http.ListenAndServe(port, mux)

	if err != nil {
		log.Fatal(err)
	}
}

func openDB() (*sql.DB, error) {

	// Получаем клиента к БД и ошибку в случае, если не удалось подключиться
	return sql.Open("mysql", "root:qAz321_mKL@tcp(localhost:3306)/blog?charset=utf8mb4&collation=utf8mb4_unicode_ci&parseTime=true")

}
