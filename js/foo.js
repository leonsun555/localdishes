"use strict";

const API_URL =
  "http://34.80.92.65:3356/getData";

var resData = null;
var filterData = null;
var pagedData = null;
var DOMloading,
  DOMcity,
  DOMtown,
  DOMcontentList,
  DOMcontentCard,
  DOMcontentTable,
  DOMmodeList,
  DOMmodeCard,
  DOMmodeTable,
  DOMpage;
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

window.onload = function () {
  let xhr = new XMLHttpRequest();

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      resData = JSON.parse(this.responseText);
      console.log(resData);
      preset();
      displayData();
    }
  });

  if (typeof XDomainRequest != "undefined") {
    //IE特別版
    xhr = new XDomainRequest();
    xhr.open(method, API_URL);
  } else {
    xhr.open("GET", API_URL);
  }

  setTimeout(() => {
    xhr.send();
  }, 2000);

  //建立可能會用到的DOM
  DOMloading = document.getElementById("loading");
  DOMcity = document.getElementById("city-selection");
  DOMtown = document.getElementById("town-selection");
  DOMcontentList = document.getElementById("content-list");
  DOMcontentCard = document.getElementById("content-card");
  DOMcontentTable = document.getElementById("content-table");
  DOMmodeList = document.getElementById("mode-list");
  DOMmodeCard = document.getElementById("mode-card");
  DOMmodeTable = document.getElementById("mode-table");
  DOMpage = document.getElementsByClassName("page")[0];
  modeChange("list");
};

function preset() {
  DOMloading.style.display = "none";
  citylistGenerate(resData);
  townlistGenerate(dataSearch(resData, "City", selectedCity));
  pagination(resData);

  DOMcity.addEventListener("mousedown", function () {
    selectedCity = DOMcity.value;
    let options = DOMtown.querySelectorAll("option");
    options.forEach((el) => {
      if (el.value !== "") el.remove();
    });
    if (selectedCity === "") {
      filterData = resData;
    } else {
      filterData = dataSearch(resData, "City", selectedCity);
      townlistGenerate(filterData);
    }
    pagination(filterData);
    displayData();
  });

  DOMtown.addEventListener("mousedown", function () {
    if (selectedCity === "") return;
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
    displayData();
  });

  DOMmodeList.addEventListener("mousedown", function () {
    modeChange("list");
  });
  DOMmodeCard.addEventListener("mousedown", function () {
    modeChange("card");
  });
  DOMmodeTable.addEventListener("mousedown", function () {
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
  let imgContainer = liContent.appendChild(document.createElement("div"));
  imgContainer.className = "img-container";
  let overlay = imgContainer.appendChild(document.createElement("div"));
  overlay.className = "img-overlay";
  let img = imgContainer.appendChild(document.createElement("img"));
  let context = liContent.appendChild(document.createElement("div"));
  context.className = "li-content-context";
  let url = context.appendChild(document.createElement("a"));
  let title = url.appendChild(document.createElement("h1"));
  let description = context.appendChild(document.createElement("p"));
  city.innerHTML = element.City;
  town.innerHTML = element.Town;
  img.src = element.PicURL;
  title.innerHTML = element.Name;
  if (element.Url !== "") {
    url.href = element.Url;
    url.target = "_blank";
  } else {
    url.href = "#";
  }
  if (element.HostWords.length > 130) {
    description.innerHTML = textCut(element.HostWords, 100);
  } else {
    description.innerHTML = element.HostWords;
  }
}

function cardMode(element) {
  let context = DOMcontentCard.appendChild(document.createElement("div"));
  context.className = "context";
  let overlay = context.appendChild(document.createElement("div"));
  overlay.className = "img-overlay-card";
  let img = context.appendChild(document.createElement("img"));
  img.className = "img-card";
  let city = context.appendChild(document.createElement("div"));
  city.className = "city-card";

  let bottom = context.appendChild(document.createElement("div"));
  bottom.className = "bottom-card";
  let town = bottom.appendChild(document.createElement("div"));
  town.className = "town-card";
  let name = bottom.appendChild(document.createElement("div"));
  name.className = "name-card";
  let line = bottom.appendChild(document.createElement("div"));
  line.className = "line-card";
  let description = bottom.appendChild(document.createElement("div"));
  description.className = "description-card";

  img.src = element.PicURL;
  name.innerHTML = element.Name;
  city.innerHTML = element.City;
  town.innerHTML = element.Town;
  description.innerHTML = textCut(element.HostWords, 50);
}

function tableMode(element) {
  let elKeys = Object.keys(element);
  //首次產生Table需額外生成thead
  if (DOMcontentTable.querySelectorAll("tr").length === 0) {
    let tHead = DOMcontentTable.appendChild(document.createElement("tr"));
    tHead.className = "t-head";
    elKeys.forEach((key, index) => {
      let tdh = tHead.appendChild(document.createElement("th"));
      tdh.className = "col-" + String(index + 1);
      tdh.innerHTML = key;
    });
  }
  let tRow = DOMcontentTable.appendChild(document.createElement("tr"));
  tRow.className = "t-row";
  elKeys.forEach((key, index) => {
    let tdr = tRow.appendChild(document.createElement("td"));
    tdr.className = "col-" + String(index + 1);
    if (key === "地址") {
      let a = tdr.appendChild(document.createElement("a"));
      a.innerHTML = element[key];
      a.title = element[key];
    } else {
      tdr.innerHTML = element[key];
    }
  });
}

function textCut(text, length) {
  return text.slice(0, length) + "...";
}

function modeChange(mode) {
  DOMpage.className = DOMpage.className.replace(" page-list", "");
  switch (mode) {
    case "list":
      //list加入特別class
      DOMpage.className += " page-list";
      DOMcontentList.style.cssText = "display:block;";
      DOMcontentCard.style.cssText = "display:none !important;";
      DOMcontentTable.style.cssText = "display:none !important;";
      modeBtnStyleChange(
        DOMmodeList.querySelector("g"),
        DOMmodeCard.querySelector("g"),
        DOMmodeTable.querySelector("g")
      );
      break;
    case "card":
      DOMcontentList.style.cssText = "display:none !important;";
      DOMcontentCard.style.cssText = "display:grid;";
      DOMcontentTable.style.cssText = "display:none !important;";
      modeBtnStyleChange(
        DOMmodeCard.querySelector("g"),
        DOMmodeList.querySelector("g"),
        DOMmodeTable.querySelector("g")
      );
      break;
    case "table":
      DOMcontentList.style.cssText = "display:none !important;";
      DOMcontentCard.style.cssText = "display:none !important;";
      DOMcontentTable.style.cssText = "display:table;";
      modeBtnStyleChange(
        DOMmodeTable.querySelector("g"),
        DOMmodeCard.querySelector("g"),
        DOMmodeList.querySelector("g")
      );
      break;
    default:
      break;
  }

  function modeBtnStyleChange(target, other1, other2) {
    target.querySelectorAll("rect").forEach((el) => {
      el.style.cssText = "fill: #black";
    });
    other1.querySelectorAll("rect").forEach((el) => {
      el.style.cssText = "fill: #7f7f7f";
    });
    other2.querySelectorAll("rect").forEach((el) => {
      el.style.cssText = "fill: #7f7f7f";
    });
  }
}

function townlistGenerate(data) {
  townList = [];
  data.forEach((el) => {
    townList.push(el.Town);
  });
  townList = distinct(townList);
  DOMtown = insertOption("town-selection", townList);
}

function citylistGenerate(data) {
  cityList = [];
  data.forEach((el) => {
    cityList.push(el.City);
  });
  cityList = distinct(cityList);
  DOMcity = insertOption("city-selection", cityList);
}

function insertOption(nodeId, content) {
  let element = document.getElementById(nodeId);
  content.forEach((el) => {
    let option = element.appendChild(document.createElement("option"));
    option.value = el;
    option.innerHTML = el;
  });
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
  });
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

  let pagePrefix = DOMpage.appendChild(document.createElement("div"));
  pagePrefix.className = "page-prefix";
  pagePrefix.innerHTML =
    "美食頁次 " + pageProps.selected + "/" + pageProps.length;
  let pageBtnGroup = DOMpage.appendChild(document.createElement("div"));
  pageBtnGroup.className = "page-btngroup";

  while (counter <= pageProps.length) {
    let pageBtn = pageBtnGroup.appendChild(document.createElement("button"));
    pageBtn.className = "page-btn";
    //預設第一頁為active
    if (counter === 1) pageBtn.className += " page-btn-active";
    pageBtn.innerHTML = counter;
    pageBtn.addEventListener("mousedown", function (evt) {
      pageProps.selected = evt.target.innerHTML;
      pagePrefix.innerHTML =
        "美食頁次 " + pageProps.selected + "/" + pageProps.length;
      pageProps.payload = pagedData[pageProps.selected - 1];

      //active button class 變更
      let current = document.getElementsByClassName("page-btn-active");
      current[0].className = current[0].className.replace(
        " page-btn-active",
        ""
      );
      evt.target.className += " page-btn-active";
      displayData();
    });
    counter = counter + 1;
  }
}
