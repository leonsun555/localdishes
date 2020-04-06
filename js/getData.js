var data = null;

var xhr = new XMLHttpRequest();
xhr.withCredentials = false;

xhr.addEventListener("readystatechange", function () {
	if (this.readyState === this.DONE) {
		console.log(this.responseText);
	}
});

xhr.open("GET", "https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx");

xhr.send(data);