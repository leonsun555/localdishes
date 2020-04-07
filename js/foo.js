// var res = null;

// var xhr = new XMLHttpRequest();

// xhr.addEventListener("readystatechange", function () {
// 	if (this.readyState === this.DONE) {
// 		// console.log(this.responseText);
// 		res = JSON.parse(this.responseText);
// 	}
// });

// xhr.open("GET", "https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx");

// xhr.send();
"use strict";

var resData = null;
var filterData = null;
var pagedData = null;
var DOMcity,
  DOMtown,
  DOMcontentList,
  DOMcontentCard,
  DOMcontentTable,
  DOMmodeList,
  DOMmodeCard,
  DOMmodeTable,
  DOMpage;
var isLoading = true;
var cityList = [];
var townList = [];
var selectedCity = "";
var selectedTown = "";
var pageProps = {
  length: 0,
  selected: 0,
  pageSize: 10,
  payload: [],
};
// var selectedMode = "";

//建立可能會用到的DOM
window.onload = function () {
  DOMcity = document.getElementById("city-selection");
  DOMtown = document.getElementById("town-selection");
  DOMcontentList = document.getElementById("content-list");
  DOMcontentCard = document.getElementById("content-card");
  DOMcontentTable = document.getElementById("content-table");
  DOMmodeList = document.getElementById("mode-list");
  DOMmodeCard = document.getElementById("mode-card");
  DOMmodeTable = document.getElementById("mode-table");
  DOMpage = document.getElementById("page");
  modeChange("list");
};

(function () {
  let xhr = new XMLHttpRequest();
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      resData = JSON.parse(this.responseText);
      console.log(resData);
      preset();
      displayData();
    }
  });
  xhr.open(
    "GET",
    "https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx"
  );
  xhr.send();
})();

function preset() {
  isLoading = false;
  citylistGenerate(resData);
  townlistGenerate(dataSearch(resData, "City", selectedCity));
  pagination(resData);

  DOMcity.addEventListener("mouseup", function () {
    //重新賦值給selectedCity
    selectedCity = DOMcity.value;
    let options = DOMtown.querySelectorAll("option");
    options.forEach((el) => {
      if (el.value !== "") el.remove();
    });  
    if(selectedCity === "") {
      filterData = resData;
    }else {
      filterData = dataSearch(resData, "City", selectedCity)
    }
    townlistGenerate(filterData);
    pagination(filterData);
    displayData();
  });

  DOMtown.addEventListener("mouseup", function () {
    //重新賦值給selectedTown
    selectedTown = DOMtown.value;
    if (selectedTown === "") {
      filterData = dataSearch(resData, "City", selectedCity);
    } else {
      filterData = dataSearch(resData, null, {
        city: selectedCity,
        town: selectedTown,
      });
    }
    pagination(filterData);
    displayData(filterData);
  });

  DOMmodeList.addEventListener("mouseup", function () {
    modeChange("list");
  });
  DOMmodeCard.addEventListener("mouseup", function () {
    modeChange("card");
  });
  DOMmodeTable.addEventListener("mouseup", function () {
    modeChange("table");
  });
}

function displayData() {
  let data = pageProps.payload;
  DOMcontentList.textContent = "";
  DOMcontentCard.textContent = "";
  DOMcontentTable.textContent = "";

  data.forEach((el, index) => {
    //Table專用資料
    let elForTable = {
      編號: index + 1,
      行政區域: el.City,
      鄉鎮區: el.Town,
      商家: el.Name,
      地址: el.Address,
    };
    liMode(el);
    cardMode(el);
    tableMode(elForTable);
  });
}

function liMode(element) {
  let li = DOMcontentList.appendChild(document.createElement("li"));
  let liPrefix = li.appendChild(document.createElement("div"));
  liPrefix.className = "li-prefix";
  let liContent = li.appendChild(document.createElement("div"));
  liContent.className = "li-content";
  let city = liPrefix.appendChild(document.createElement("div"));
  let town = liPrefix.appendChild(document.createElement("div"));
  let img = liContent.appendChild(document.createElement("img"));
  let title = liContent.appendChild(document.createElement("h2"));
  let description = liContent.appendChild(document.createElement("p"));
  city.innerHTML = element.City;
  town.innerHTML = element.Town;
  img.src = element.PicURL;
  title.innerHTML = element.Name;
  description.innerHTML = element.HostWords;
}

function cardMode(element) {
  let context = DOMcontentCard.appendChild(document.createElement("div"));
  let district = context.appendChild(document.createElement("div"));
  let name = context.appendChild(document.createElement("div"));
  let city = district.appendChild(document.createElement("div"));
  let town = district.appendChild(document.createElement("p"));
  DOMcontentCard.style.backgroundImage = "url(" + element.PicURL + ")";
  name.innerHTML = element.Name;
  city.innerHTML = element.City;
  town.innerHTML = element.Town;
}

function tableMode(element) {
  let elKeys = Object.keys(element);
  //首次產生Table需額外生成thead
  if (!DOMcontentTable.getElementsByTagName("tr")) {
    let tHead = DOMcontentTable.appendChild(document.createElement("tr"));
    tHead.className = "t-head";
    elKeys.forEach((key) => {
      let tdh = tHead.appendChild(document.createElement("td"));
      tdh.innerHTML = key;
    });
  }
  let tRow = DOMcontentTable.appendChild(document.createElement("tr"));
  tRow.className = "t-row";
  elKeys.forEach((key) => {
    let tdr = tRow.appendChild(document.createElement("td"));
    tdr.innerHTML = element[key];
  });
}

function modeChange(mode) {
  switch (mode) {
    case "list":
      DOMcontentList.style.display = "block";
      DOMcontentCard.style.display = "none";
      DOMcontentTable.style.display = "none";
      break;
    case "card":
      DOMcontentList.style.display = "none";
      DOMcontentCard.style.display = "block";
      DOMcontentTable.style.display = "none";
      break;
    case "table":
      DOMcontentList.style.display = "none";
      DOMcontentCard.style.display = "none";
      DOMcontentTable.style.display = "block";
      break;
    default:
      DOMcontentList.style.display = "block";
      DOMcontentCard.style.display = "none";
      DOMcontentTable.style.display = "none";
      break;
  }
}

function townlistGenerate(data) {
  townList = [];
  data.forEach((el) => {
    townList.push(el.Town);
  });
  townList = distinct(townList);
  DOMtown = insertOption("town-selection", townList);
  // selectedTown = DOMtown.value;
}

function citylistGenerate(data) {
  cityList = [];
  data.forEach((el) => {
    cityList.push(el.City);
  });
  cityList = distinct(cityList);
  DOMcity = insertOption("city-selection", cityList);
  // selectedCity = DOMcity.value;
}

function insertOption(nodeId, content) {
  let element = document.getElementById(nodeId);
  content.forEach((el) => {
    let option = element.appendChild(document.createElement("option"));
    option.value = el;
    option.innerHTML = el;
  });
  // element.value = element.getElementsByTagName("option")[0].value;
  return element;
}

function dataSearch(data, colume, keys) {
  if (colume === null) {
    return data.filter((el) => {
      return el.City === keys.city && el.Town === keys.town;
    });
  } else {
    return data.filter((el) => {
      return el[colume] === keys;
    });
  }
}

function distinct(arr) {
  let arrDistinct = [];
  for (let i = 0; i < arr.length; i++) {
    if (!arrDistinct.includes(arr[i])) {
      arrDistinct.push(arr[i]);
    }
  }
  return arrDistinct;
}

function pagination(data) {
  let pageToRemove = DOMpage.querySelectorAll("div");
  pageToRemove.forEach((el) => {
    el.remove();
  })
  let size = pageProps.pageSize;
  let counter = 1;
  pagedData = Array.apply(null, {
    length: Math.ceil(data.length / size),
  }).map((_, i) => {
    return data.slice(i * size, (i + 1) * size);
  });
  pageProps.length = pagedData.length;
  pageProps.selected = 1;
  pageProps.payload = pagedData[pageProps.selected - 1];
  while(counter <= pageProps.length) {
    let pageBtn = DOMpage.appendChild(document.createElement("div"));
    pageBtn.className = "page-btn";
    pageBtn.style.cssText = "float:left;width: 20px;height: 20px;cursor: pointer;border: 1px solid black;";
    pageBtn.innerHTML = counter;
    pageBtn.addEventListener("mouseup", function() {
      pageProps.selected = pageBtn.innerHTML;
      pageProps.payload = pagedData[pageProps.selected - 1];
      displayData();
    })
    counter = counter + 1;
  }
}
