package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/connorstake/shmiddleware/chainconnector"
	"github.com/gorilla/mux"
)

func main() {

	r := mux.NewRouter()

	r.HandleFunc("/hello", Hello)
	r.HandleFunc("/order", Order).Methods("POST")
	r.HandleFunc("/balance", GetBalance).Methods("POST")

	fmt.Println("Listening on port: 8080...")

	http.ListenAndServe(":8080", r)

}

func Hello(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello there!!")
}

func Order(w http.ResponseWriter, r *http.Request) {

	var OrderInfo struct {
		// Simplified
		OrderType string
		Token     string
		Amount    string
	}

	err := json.NewDecoder(r.Body).Decode(&OrderInfo)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Fprintf(w, "%v\n", OrderInfo)
	fmt.Printf("%v\n", OrderInfo)
}

func GetBalance(w http.ResponseWriter, r *http.Request) {
	var GetBalanceRequest struct {
		// Simplified
		Address string
	}

	err := json.NewDecoder(r.Body).Decode(&GetBalanceRequest)
	if err != nil {
		log.Fatal(err)
	}

	amount, err := chainconnector.QueryState(GetBalanceRequest.Address)
	if err != nil {
		fmt.Println(err)
	}

	fmt.Fprint(w, amount )
}
