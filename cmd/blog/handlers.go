package main

import (
	"database/sql"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strings"
	// "strconv"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

const (
	FEATURED_TRUE  = 1
	FEATURED_FALSE = 0
)

type indexPageData struct {
	ResourceName    string
	Title           string
	Subtitle        string
	TitleFeatured   string
	FeaturedPosts   []*postData
	TitleMR         string
	MostRecentPosts []*postData
	TitleSubscribe  string
}

type postData struct {
	Id           string `db:"id"`
	Url          string `db:"url"`
	Title        string `db:"title"`
	Subtitle     string `db:"subtitle"`
	Author       string `db:"author"`
	AuthorImgMod string `db:"author_url"`
	PublishDate  string `db:"publish_date"`
	ImgModifier  string `db:"image_url"`
	Featured     string `db:"featured"`
	Tag          string `db:"tag"`
	Content      string `db:"content"`
	PostURL      string
}
type postPageData struct {
	ResourceName   string
	PostRow        postData
	TitleSubscribe string
	Texts          []string
}

func index(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		postsFeatured, err := getPosts(db, FEATURED_TRUE)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		postsMostRecent, err := getPosts(db, FEATURED_FALSE)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		ts, err := template.ParseFiles("pages/index.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		data := indexPageData{
			ResourceName:    "Escape.",
			Title:           "Let's do it together.",
			Subtitle:        "We travel the world in search of stories. Come along for the ride.",
			TitleFeatured:   "Featured Posts",
			FeaturedPosts:   postsFeatured,
			TitleMR:         "Most Recent",
			MostRecentPosts: postsMostRecent,
			TitleSubscribe:  "Stay in Touch",
		}

		err = ts.Execute(w, data)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		log.Println("Request completed successfully")
	}
}

func post(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {

		postURL := mux.Vars(r)["postURL"]

		post, err := postByUrl(db, postURL)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Post not found", 404)
				log.Println(err)
				return
			}

			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		ts, err := template.ParseFiles("pages/post.html") // Главная страница блога
		if err != nil {
			http.Error(w, "Internal Server Error", 500) // В случае ошибки парсинга - возвращаем 500
			log.Println(err.Error())                    // Используем стандартный логгер для вывода ошибки в консоль
			return                                      // Не забываем завершить выполнение ф-ии
		}

		data := postPageData{
			ResourceName:   "Escape.",
			PostRow:        post,
			TitleSubscribe: "Stay in Touch",
			Texts:          strings.Split(post.Content, "\n"),
		}

		err = ts.Execute(w, data) // Запускаем шаблонизатор для вывода шаблона в тело ответа
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		log.Println("post page loaded successfully")
	}
}

func getPosts(db *sqlx.DB, featured int) ([]*postData, error) {
	const query = `
		SELECT
			url,
			title,
			subtitle,
			author,
			author_url,
			publish_date,
			image_url,
			featured,
			tag
		FROM
			post
		WHERE featured = ?`

	var posts []*postData

	err := db.Select(&posts, query, featured)

	if err != nil {
		return nil, err
	}

	for _, post := range posts {
		post.PostURL = "/post/" + post.Url // Формируем исходя из url поста в базе
	}

	fmt.Println(posts)

	return posts, nil
}

func postByUrl(db *sqlx.DB, postURL string) (postData, error) {
	const query = `
		SELECT
			title,
			subtitle,
			image_url,
			content
		FROM
			post
		WHERE url = ?
	`

	var post postData

	err := db.Get(&post, query, postURL)
	if err != nil {
		return postData{}, err
	}

	return post, nil
}
