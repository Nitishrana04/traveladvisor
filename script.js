const listingWrapper = document.getElementById("listing-wrapper");
var filterType = document.getElementById("filter-type");
var sortBy = document.getElementById("sort-by");
const loader = document.getElementById("loader");
const mapElement = document.getElementById("map");
const loaderWrapper = document.getElementById("loader-wrapper");
let map;
let marker;
var start_date;
var end_date;

const btn = document.querySelector(".date-button");
const form = document.querySelector("#date-form");
const checkInInput = document.getElementById("checkIn");
const checkOutInput = document.getElementById("checkOut");

function addMarker(lat, long, result_object) {
  if (!lat || !long || !map) return;
  marker = L.marker([lat, long]).addTo(map);
  marker.bindPopup(
    `<b>${result_object.name}</b><br />${result_object.address}<br /> ${result_object.location_string}.`
  );
}

function detailsComponent(details, index) {
  if (!details?.name) return;

  var listingContainer = document.createElement("div");
  listingContainer.className = "listing-container";
  listingContainer.dataset.locationId = details.location_id;
  listingContainer.addEventListener("click", listingContainerClickHandler);


  var carouselContainer = document.createElement("div");
  carouselContainer.id = `${details?.name}`;
  carouselContainer.className = "carousel slide";
  carouselContainer.setAttribute("data-ride", "carousel");

  // Create carousel inner element
  var carouselInner = document.createElement("div");
  carouselInner.className = "carousel-inner";

  // Create images for carousel items
  for (var i = 0; i < 2; i++) {
    var carouselItem1 = document.createElement("div");
    carouselItem1.className = `carousel-item ${i == 0 ? "active" : ""}`;
    carouselInner.appendChild(carouselItem1);

    var img1 = document.createElement("img");
    img1.className = "d-block";
    img1.width = "250";
    img1.height = "200";
    img1.src =
      details.photo?.images?.original.url || "https://placehold.co/200x150";
    img1.alt = "First slide";
    carouselItem1.appendChild(img1);
  }

  carouselContainer.appendChild(carouselInner);

  // Create previous and next controls
  var prevControl = document.createElement("a");
  prevControl.className = "carousel-control-prev";
  prevControl.href = `#${details?.name}`;
  prevControl.role = "button";
  prevControl.setAttribute("data-slide", "prev");
  carouselContainer.appendChild(prevControl);

  var prevIcon = document.createElement("span");
  prevIcon.className = "carousel-control-prev-icon";
  prevIcon.setAttribute("aria-hidden", "true");
  prevControl.appendChild(prevIcon);

  var prevLabel = document.createElement("span");
  prevLabel.className = "sr-only";
  prevLabel.innerText = "Previous";
  prevControl.appendChild(prevLabel);

  var nextControl = document.createElement("a");
  nextControl.className = "carousel-control-next";
  nextControl.href = `#${details?.name}`;
  nextControl.role = "button";
  nextControl.setAttribute("data-slide", "next");
  carouselContainer.appendChild(nextControl);

  var nextIcon = document.createElement("span");
  nextIcon.className = "carousel-control-next-icon";
  nextIcon.setAttribute("aria-hidden", "true");
  nextControl.appendChild(nextIcon);

  var nextLabel = document.createElement("span");
  nextLabel.className = "sr-only";
  nextLabel.innerText = "Next";
  nextControl.appendChild(nextLabel);

  var detailsContainer = document.createElement("div");
  detailsContainer.className = "details-container";

  var heading = document.createElement("div");
  heading.className = "text-truncate";
  heading.innerText = `${index + 1}. ${details?.name}`;
  detailsContainer.appendChild(heading);

  var ratingContainer = document.createElement("div");
  ratingContainer.className = "rating-container";

  for (var i = 0; i < details.rating; i++) {
    var ratingDot = document.createElement("div");
    ratingDot.className = "rating-dot";
    ratingContainer.appendChild(ratingDot);
  }

  detailsContainer.appendChild(ratingContainer);

  var br1 = document.createElement("br");
  detailsContainer.appendChild(br1);

  var span1 = document.createElement("span");
  span1.innerText = `${details.address || "-"}`;
  detailsContainer.appendChild(span1);

  var br2 = document.createElement("br");
  detailsContainer.appendChild(br2);

  var span2 = document.createElement("span");
  span2.innerText = `${details.location_string || "-"}`;
  detailsContainer.appendChild(span2);

  var br3 = document.createElement("br");
  detailsContainer.appendChild(br3);

  listingContainer.appendChild(carouselContainer);
  listingContainer.appendChild(detailsContainer);

  listingWrapper.appendChild(listingContainer);
}

function initMap(lat, long) {
  map = L.map("map").setView([lat, long], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Trip Advisor <a href="https://www.tripadvisor.com/">Trip Advisor</a>',
    maxZoom: 18,
  }).addTo(map);
  // L.control.zoom({ position: "topright" }).addTo(map);
  map.zoomControl.setPosition("topright");
}

function removeMap() {
  if (map) {
    map.remove();
    map = null;
    mapElement.classList = [];
    mapElement.classList.add("map");
  }
}
function removeListingAndMap() {
  while (listingWrapper.firstChild) {
    listingWrapper.removeChild(listingWrapper.firstChild);
  }
  removeMap();
}

function listingContainerClickHandler(event) {
   var locationId;
   var target = event.target;

   while (target !== document) {
     if (target.classList.contains("listing-container")) {
       locationId = target.dataset.locationId;
       console.log("Location ID:", locationId);
     }
     target = target.parentNode;
   }

   allData.forEach(({result_object}) => {
    if(result_object.location_id === locationId){
      removeMap();
      initMap(result_object.latitude, result_object.longitude);
      addMarker(result_object.latitude, result_object.longitude, result_object);
      marker.bindPopup(`<b>${result_object.name}</b><br />${result_object.address}<br /> ${result_object.location_string}.`).openPopup();
    }
   });
}

document.addEventListener("DOMContentLoaded", function () {
  const searchBar = document.getElementById("search-bar");
  searchBar.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      while (filterType.firstChild) {
        filterType.removeChild(filterType.firstChild);
      }
      while (sortBy.firstChild) {
        sortBy.removeChild(sortBy.firstChild);
      }
      removeListingAndMap();
      performSearch(event.target.value);
    }
  });

  sortBy.addEventListener("change", sortByChangeHandler);
});

function applyFilter(event) {
  console.log(event.target.dataFilter);
  const tempData = allData.filter(
    (item) =>
      event.target.dataFilter === "all" ||
      item.result_type === event.target.dataFilter
  );
  removeListingAndMap();
  generateListing(tempData);
  console.log(tempData);
}

function generateDropdownList(dropdownList) {
  var dropdownItem = document.createElement("li");
  var dropdownItemAnchor = document.createElement("a");

  dropdownItemAnchor.className = "dropdown-item";
  dropdownItemAnchor.innerText = "All";
  dropdownItemAnchor.dataFilter = "all";
  dropdownItemAnchor.addEventListener("click", applyFilter);
  dropdownItem.appendChild(dropdownItemAnchor);
  filterType.appendChild(dropdownItem);
  dropdownList.forEach((item) => {
    var dropdownItem = document.createElement("li");
    var dropdownItemAnchor = document.createElement("a");

    dropdownItemAnchor.className = "dropdown-item";
    dropdownItemAnchor.innerText = item;
    dropdownItemAnchor.dataFilter = item;
    dropdownItemAnchor.addEventListener("click", applyFilter);
    dropdownItem.appendChild(dropdownItemAnchor);
    filterType.appendChild(dropdownItem);
  });
}

function generateSortByDropdownList() {
  var sortByList = ["Rating", "Name", "Popularity"];
  sortByList.forEach((item) => {
    var dropdownItem = document.createElement("li");
    var dropdownItemAnchor = document.createElement("a");

    dropdownItemAnchor.className = "dropdown-item";
    dropdownItemAnchor.innerText = item;
    dropdownItemAnchor.sortFilter = item;
    dropdownItemAnchor.addEventListener("click", sortByChangeHandler);
    dropdownItem.appendChild(dropdownItemAnchor);
    sortBy.appendChild(dropdownItem);
  });
}

function sortByChangeHandler(event) {
  const sortBy = event.target.sortFilter.toLowerCase();
  if (sortBy === "rating") {
    filteredData = sortByDescending(allData , "rating");
  } else if (sortBy === "name") {
    filteredData = sortByDescending(allData, 'name');
  } else if (sortBy === "distance") {
    filteredData = sortByDistanceAscending(allData);
  }
  removeListingAndMap();
  generateListing(filteredData);
}  

function sortByDescending(array, type) {
  return array.sort(function (a, b) {
    return b.result_object[type] - a.result_object[type];
  });
}

var allData = [];
var filteredData = [];
var dropdownList = [];

async function performSearch(query = "london") {
  listingWrapper.innerHTML = "";
  removeMap();

  const url = `https://travel-advisor.p.rapidapi.com/locations/auto-complete?query=${query}&lang=en_US&units=km`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "dd308f54a1msh4f1346ac6d9cd40p12e0efjsn68fefe38ca5f",
      "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
    },
  };

  try {
    loader.classList.add("loader");
    loaderWrapper.classList.remove("hide");
    const response = await fetch(url, options);
    const result = await response.text();
    const data = JSON.parse(result).data;

    if (data.length > 0) {
      loader.classList.remove("loader");
      loaderWrapper.classList.add("hide");
    }

    data.forEach(({ result_type, result_object }) => {
      result_object.rating = Math.floor(Math.random() * 5) + 1;
      dropdownList.push(result_type);
    });
    allData = data;
    generateListing(data);
    generateSortByDropdownList();

    generateDropdownList([...new Set(dropdownList)]);
  } catch (error) {
    console.error(error);
  }
}

function generateListing(res) {
  res.forEach(({ result_object }, index) => {
    if (result_object.latitude && result_object.longitude && !map) {
      initMap(result_object.latitude, result_object.longitude);
    }
    detailsComponent(result_object, index);
    if (map) {
      addMarker(result_object.latitude, result_object.longitude, result_object);
    }
  });
}

performSearch();

$("#range-input").daterangepicker(
  {
    startDate: "07/06/2023",
    endDate: "07/12/2023",
    minDate: "01/01/2023",
    maxDate: "01/01/2024",
  },
  function (start, end, label) {
    start_date = start;
    end_date = end;
  }
);
