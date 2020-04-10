"use strict";

const API_URL = "http://34.80.92.65:3356/getData";
const PAGE_SIZE = 10;

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
var selectedCity = "";
var selectedTown = "";
var pageProps = {
  length: 0,
  selected: 0,
  payload: [],
};

window.onload = function () {
  let xhr = new XMLHttpRequest();

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      //抓取到的資料解析後存至全域變數 => resData
      resData = JSON.parse(this.responseText);
      preset();
      displayData();
    }
  });

  if (typeof XDomainRequest != "undefined") {
    //IE專用
    xhr = new XDomainRequest();
    xhr.open(method, API_URL);
  } else {
    xhr.open("GET", API_URL);
  }

  setTimeout(() => {
    xhr.send();
  }, 2000);

  //將所有會頻繁操作的DOM存成全域變數
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

  //預設清單顯示模式
  modeChange("list");
};  

//window滾動事件
window.onscroll = function () {
  let adblock2 = document.getElementById("block2");
  let adblock3 = document.getElementById("block3");
  //取得第2個廣告的偏移位置
  let offset2   = adblock2.getBoundingClientRect().bottom;

  //控制第3個廣告的class
  if(offset2 <= 0) {
    adblock3.className = "ad-fixed";
  }else {
    adblock3.className = "";
  }
}

function preset() {
  DOMloading.style.display = "none";
  citylistGenerate(resData);
  townlistGenerate(dataSearch(resData, "City", selectedCity));
  pagination(resData);

  //行政區域選擇dropdown點擊事件
  DOMcity.addEventListener("click", function () {
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

  //鄉鎮選擇dropdown點擊事件
  DOMtown.addEventListener("click", function () {
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

  //模式選擇點擊事件
  DOMmodeList.addEventListener("click", function () {
    modeChange("list");
  });
  DOMmodeCard.addEventListener("click", function () {
    modeChange("card");
  });
  DOMmodeTable.addEventListener("click", function () {
    modeChange("table");
  });
}

//資料顯示邏輯
function displayData() {
  let data = pageProps.payload;
  DOMcontentList.textContent = "";
  DOMcontentCard.textContent = "";
  DOMcontentTable.textContent = "";

  data.forEach((el, index) => {
    //Table專用資料欄位
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

//清單模式產出DOM element
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

  //敘述字數長度過長截斷(約3行)
  if (element.HostWords.length > 130) {
    description.innerHTML = textCut(element.HostWords, 100);
  } else {
    description.innerHTML = element.HostWords;
  }
}

//卡片模式產出DOM element
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
  //敘述長度過長截斷(約2行)
  description.innerHTML = textCut(element.HostWords, 50);
}

//表格模式產出DOM element
function tableMode(element) {
  //取得所有傳入的key
  let elKeys = Object.keys(element);

  //首次產生Table需額外生成thead row
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
      //list加入特別class(page element長度不同)
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

  //選擇模式svg顏色切換
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

function citylistGenerate(data) {
  let cityList = [];
  //City欄位資料取出
  data.forEach((el) => {
    cityList.push(el.City);
  });
  //篩出不重複資料
  cityList = distinct(cityList);
  //插入選項
  DOMcity = insertOption("city-selection", cityList);
}

function townlistGenerate(data) {
  let townList = [];
  data.forEach((el) => {
    townList.push(el.Town);
  });
  townList = distinct(townList);
  DOMtown = insertOption("town-selection", townList);
}

//選項插入
function insertOption(nodeId, content) {
  let element = document.getElementById(nodeId);
  content.forEach((el) => {
    let option = element.appendChild(document.createElement("option"));
    option.value = el;
    option.innerHTML = el;
  });
  return element;
}

//資料查詢
function dataSearch(data, colume, keys) {
  //如果沒有查詢資料欄位,以City and Town欄位為條件查詢
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
  //定義比對array
  let arrDistinct = [];
  for (let i = 0; i < arr.length; i++) {
    //判斷比對array是否有重複資料,沒有的話再push in
    if (!arrDistinct.includes(arr[i])) {
      arrDistinct.push(arr[i]);
    }
  }
  return arrDistinct;
}

//分頁邏輯及DOM element產出
function pagination(data) {
  let pageToRemove = DOMpage.querySelectorAll("div");
  pageToRemove.forEach((el) => {
    el.remove();
  });
  let counter = 1;

  //資料分組
  pagedData = arrayGrouping(data);
  pageProps.length = pagedData.length;
  pageProps.selected = 1;
  pageProps.payload = pagedData[pageProps.selected - 1];

  let pagePrefix = DOMpage.appendChild(document.createElement("div"));
  pagePrefix.className = "page-prefix";
  pagePrefix.innerHTML =
    "美食頁次 " + pageProps.selected + "/" + pageProps.length;
  let pageBtnGroup = DOMpage.appendChild(document.createElement("div"));
  pageBtnGroup.className = "page-btngroup";

  //產出頁次按鈕DOM element
  while (counter <= pageProps.length) {
    let pageBtn = pageBtnGroup.appendChild(document.createElement("button"));
    pageBtn.className = "page-btn";
    //active button class預設為第一頁
    if (counter === 1) pageBtn.className += " page-btn-active";
    pageBtn.innerHTML = counter;

    //頁次按鈕點擊事件
    pageBtn.addEventListener("click", function (evt) {
      //更新選中頁次
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

      //DOM element re-rendered
      displayData();
    });
    counter = counter + 1;
  }
}

function arrayGrouping(data) {
  //先建立適當長度的array,但不放內容
  //再將每頁資料分段後map進array
  return Array.apply(null, {
    length: Math.ceil(data.length / PAGE_SIZE),
  }).map((_, i) => {
    return data.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE);
  });
}
