package main

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"

	//"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"

	// "strconv"
	"strings"

	"github.com/google/uuid"
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
	Id          string `db:"id"`
	Url         string `db:"url"`
	Title       string `db:"title"`
	Subtitle    string `db:"subtitle"`
	Author      string `db:"author"`
	AuthorImg   string `db:"image_author"`
	PublishDate string `db:"publish_date"`
	ImageHd     string `db:"image_hd"`
	ImageSd     string `db:"image_sd"`
	Featured    string `db:"featured"`
	Tag         string `db:"tag"`
	Content     string `db:"content"`
	PostURL     string
}
type postDataRequest struct {
	Title             string `json:"title"`
	Description       string `json:"description"`
	Author_name       string `json:"author_name"`
	Publish_date      string `json:"publish_date"`
	Content           string `json:"content"`
	Author_photo_name string `json:"author_photo_name"`
	Author_photo      string `json:"author_photo"`
	Image_hd_name     string `json:"image_hd_name"`
	Image_hd          string `json:"image_hd"`
	Image_sd_name     string `json:"image_sd_name"`
	Image_sd          string `json:"image_sd"`
}
type postPageData struct {
	ResourceName   string
	PostRow        postData
	TitleSubscribe string
	Texts          []string
}
type adminPageData struct {
	ResourceName string
	Title        string
}
type loginPageData struct {
	ResourceName string
	Title        string
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

		log.Println("home page completed successfully")
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

		ts, err := template.ParseFiles("pages/post.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		data := postPageData{
			ResourceName:   "Escape.",
			PostRow:        post,
			TitleSubscribe: "Stay in Touch",
			Texts:          strings.Split(post.Content, "\n"),
		}

		err = ts.Execute(w, data)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		log.Println("post page loaded successfully")
	}
}

func admin(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		ts, err := template.ParseFiles("pages/admin.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		data := adminPageData{
			ResourceName: "Escape.",
			Title:        "Admin page",
		}

		err = ts.Execute(w, data)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		log.Println("admin page loaded successfully")
	}
}

func login(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		ts, err := template.ParseFiles("pages/login.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		data := loginPageData{
			ResourceName: "Escape.",
			Title:        "Log In",
		}

		err = ts.Execute(w, data)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		log.Println("login page loaded successfully")
	}
}

func getPosts(db *sqlx.DB, featured int) ([]*postData, error) {
	const query = `
		SELECT
			url,
			title,
			subtitle,
			author,
			image_author,
			publish_date,
			image_hd,
			image_sd,
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
		post.PostURL = "/post/" + post.Url
	}

	return posts, nil
}

func postByUrl(db *sqlx.DB, postURL string) (postData, error) {
	const query = `
		SELECT
			title,
			subtitle,
			image_hd,
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

func createPost(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		var req postDataRequest
		err = json.Unmarshal(body, &req)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		if checkEmptyField(req) {
			http.Error(w, "Internal Server Error", 500)
			return
		}

		var postUrl string

		postUrl, err = savePost(db, req)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		// http.ResponseWriter

		log.Println("successfully created new post with url: /post/" + postUrl)
	}
}

func checkEmptyField(data postDataRequest) bool {
	return (data.Title == "" || data.Description == "" || data.Author_name == "" || data.Publish_date == "" || data.Content == "" || data.Author_photo_name == "" || data.Author_photo == "" || data.Image_hd_name == "" || data.Image_hd == "" || data.Image_sd_name == "" || data.Image_sd == "")
}

func savePost(db *sqlx.DB, req postDataRequest) (string, error) {
	const query = `
		INSERT INTO post
		(
			title,
			subtitle,
			author,
			publish_date,
			content,
			image_author,
			image_hd,
			image_sd,
			url
		)
		VALUES
		(
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?,
			?
		)
	`
	encodeAndSaveImage(req.Author_photo, "static/img/", req.Author_photo_name)
	encodeAndSaveImage(req.Image_hd, "static/img/", req.Image_hd_name)
	encodeAndSaveImage(req.Image_sd, "static/img/", req.Image_sd_name)

	postUrl := uuid.New().String()

	_, err := db.Exec(query,
		req.Title,
		req.Description,
		req.Author_name,
		req.Publish_date,
		req.Content,
		"static/img/"+req.Author_photo_name,
		"static/img/"+req.Image_hd_name,
		"static/img/"+req.Image_sd_name,
		postUrl,
	)
	return postUrl, err
}

func encodeAndSaveImage(encodedFile string, savePath string, fileName string) error {

	img, err := base64.StdEncoding.DecodeString(encodedFile)
	if err != nil {
		return err
	}

	file, err := os.Create(savePath + fileName)
	if err != nil {
		return err
	}

	_, err = file.Write(img)
	if err != nil {
		return err
	}

	return nil
}
