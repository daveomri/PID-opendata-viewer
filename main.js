// Data url
const url = 'https://gist.githubusercontent.com/oldamalec/161956587b930cd8aa3628c2da24579f/raw/0132aa3624141745862e55f48defc55b007b02cb/opendata-pid-stops.js';
// Object where the open data are stored
let opendata = new Object();

/**
 * Function downloads data from url.
 * @param {String} url Url with data.
 * @param {Function} callback Callback for XMLHttpsRequest.
 */
function getJSON (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';

  xhr.onload = function() {
    var status = xhr.status;

    if (status == 200) {
      callback(null, xhr.response);
    } else {
      callback(status);
    }
  };

  xhr.send();
}

/**
 * Function creates the search content, search bar and button.
 * @returns Document element with search content.
 */
function createSearchContent() {
  // Search container
  const searchDiv = document.createElement('div');
  searchDiv.id = 'search-bar';
  searchDiv.style.height = '30px';
  searchDiv.style.width = '100%';
  searchDiv.style.paddingTop = '9px';

  // Search text
  const searchText = document.createTextNode('Hledat');

  // Search bar
  const searchBar = document.createElement('input');
  searchBar.type = 'text';
  //searchBar.placeholder = 'Hledat';
  searchBar.name = 'text';
  searchBar.addEventListener("keyup", (e) => {
    const searchDiv = document.getElementById('search-bar');
    const button = searchDiv.querySelector('button');
    const input = searchDiv.querySelector('input');
    if (input.value === '') {
      button.disabled = true;
    } else {
      // Run search if the enter button was pressed.
      if (e.key === 'Enter') {
        search();
      }
      button.disabled = false;
    }
  });

  // Search button
  const searchButton = document.createElement('button');
  searchButton.type = 'submit';
  searchButton.textContent = 'Hledej!';
  searchButton.onclick = search;
  searchButton.disabled = true;

  // Append the elements
  searchDiv.appendChild(searchText);
  searchDiv.appendChild(searchBar);
  searchDiv.appendChild(searchButton);

  return searchDiv;
}

/**
 * Function loads the data, creates the search content.
 */
function loadData() {
  const div = document.getElementById('solution');
  const button = div.querySelector('button');
  button.disabled = true;

  // Callback for downloading the open data.
  const callback = (err, data) => {
    if (err != null) {
      console.error(err);
    } else {
      opendata = data;
      button.textContent = "Aktualizovat data o zastávkách";

      div.appendChild(createSearchContent());
      button.onclick = updateData;
    }
    button.disabled = false;
  };

  getJSON(url, callback);
}

/**
 * Function updates the open data.
 */
function updateData() {
  const div = document.getElementById('solution');
  const button = div.querySelector('button');
  button.disabled = true;

  // Callback for downloading the open data.
  const callback = (err, data) => {
    if (err != null) {
      console.error(err);
    } else {
      opendata = data;
    }
    button.disabled = false;
  };
  
  getJSON(url, callback)
}

/**
 * Function deletes given container.
 * @param {String} name Id of the div.
 */
function removeDivById(name) {
  const div = document.getElementById(name);

  if (div !== null) {
    div.parentNode.removeChild(div);
  }
}

/**
 * Function creates the content if no results were found.
 */
function noResults() {
  const div = document.getElementById('solution');


  const resultDiv = document.createElement('div');
  resultDiv.id = 'search-results';

  const infoText = document.createElement('h2');
  infoText.textContent = 'Žádné výsledky!';
  resultDiv.appendChild(infoText);

  removeDivById('search-results');
  div.appendChild(resultDiv);
}

/**
 * Function creates the content if one result was found.
 * @param {Object} result 
 */
function oneResult(result) {
  const div = document.getElementById('solution');

  const resultDiv = document.createElement('div');
  resultDiv.id = 'search-results';

  const infoText = document.createElement('h2');
  infoText.textContent = result.name;
  resultDiv.appendChild(infoText)

  const frag = document.createDocumentFragment();

  for (const element of result.stops) {
    const stopName = element.id.split('/').pop();
    
    const href = document.createElement('a');
    href.textContent = `Nástupiště ${stopName}`;
    href.href = `https://www.google.com/maps/place/${element.lat},${element.lon}`;
    href.target = '_blank';

    const lines = document.createElement('ul');
    for (const line of element.lines) {  
      const listElement = document.createElement('li');
      listElement.textContent = `${line.type} ${line.name} → ${line.direction}`;

      lines.appendChild(listElement);
    }

    const breakPoint = document.createElement('br');
    const elementDiv = document.createElement('div');
    elementDiv.appendChild(href);
    elementDiv.appendChild(breakPoint);
    elementDiv.appendChild(lines);

    frag.appendChild(elementDiv);
  }

  resultDiv.appendChild(frag);
  removeDivById('search-results');
  div.appendChild(resultDiv);
}

/**
 * Function creates the content if more results were found.
 * @param {Array} results 
 */
function multipleResults(results) {
  const div = document.getElementById('solution');
  const resultDiv = document.createElement('div');
  resultDiv.id = 'search-results';

  const infoText = document.createElement('h2');
  infoText.textContent = 'Měli jste na mysli:';
  resultDiv.appendChild(infoText)

  for (const result of results) {
    const br = document.createElement('br');
    const a = document.createElement('a');
    a.textContent = result.name;
    a.addEventListener('click', ((result)=>()=>oneResult(result))(result));
    a.href = 'javascript:void(0);';
    
    resultDiv.appendChild(a);
    resultDiv.appendChild(br);
  }
  
  removeDivById('search-results');
  div.appendChild(resultDiv);
}

 /**
  * Function searches the given name in the open data.
  */
function search() {
  const searchDiv = document.getElementById('search-bar');
  const button = searchDiv.querySelector('button');
  const input = searchDiv.querySelector('input');

  const searchInput = input.value.toLowerCase();
  const searchPattern = new RegExp(searchInput);

  const matches = opendata['stopGroups'].filter(value => searchPattern.test(value['name'].toLowerCase()));
  
  switch (matches.length) {
    case 0:
      noResults();
      break;
    case 1: 
      oneResult(matches[0]);
      break;
    default:
      multipleResults(matches)
  }
}

//initial config
const div = document.getElementById('solution');
const button = div.querySelector('button');
button.onclick = loadData;