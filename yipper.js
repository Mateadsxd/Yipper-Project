'use strict';

(function() {

  const BASE_URL = '/yipper';

  window.addEventListener('load', init);

  /**
   * Initializes the Yipper web application by setting up event
   * listeners and fetching yips.
   */
  function init() {
    fetchYips();
    id('search-term').addEventListener('input', handleSearchTermInput);
    id('search-btn').addEventListener('click', handleSearchClick);
    id('home-btn').addEventListener('click', handleHomeButtonClick);
    id('yip-btn').addEventListener('click', handleYipButtonClick);
    id('new').querySelector('form')
      .addEventListener('submit', handleFormSubmit);
  }

  /**
   * Fetches yips from the server and displays them on the home page.
   */
  function fetchYips() {
    fetch(BASE_URL + "/yips")
      .then(statusCheck)
      .then(response => response.json())
      .then(data => displayYips(data.yips))
      .catch(handleError);
  }

  /**
   * Displays the yips on the home page.
   * @param {Array} yips - An array of yip objects to be displayed.
   */
  function displayYips(yips) {
    const home = id('home');

    yips.forEach((yip) => {
      const card = createYipCard(yip);
      home.appendChild(card);
    });
  }

  /**
   * Handles the input event on the search term input field.
   */
  function handleSearchTermInput() {
    let searchTerm = id('search-term').value.trim();
    id('search-btn').disabled = searchTerm.length === 0;
  }

  /**
   * Handles the click event on the search button, performs a search based on the entered term,
   * and displays the search results.
   */
  function handleSearchClick() {
    let searchInput = id('search-term').value.trim();
    let homeElement = id("home");

    if (homeElement.classList.contains("hidden")) {
      homeElement.classList.remove("hidden");
    } else {
      id("user").classList.add("hidden");
      id("new").classList.add("hidden");
      id("error").classList.add("hidden");
    }

    fetch(BASE_URL + '/yips?search=' + encodeURIComponent(searchInput))
      .then(statusCheck)
      .then(response => response.json())
      .then(showSearchResults)
      .catch(handleError);
  }

  /**
   * Displays the search results by showing matched posts and hiding non-matched posts.
   * @param {Object} response - The response object containing the matched yips.
   */
  function showSearchResults(response) {
    let allPosts = Array.from(document.querySelectorAll(".card"));
    let yipIDs = new Set(response.yips.map(yip => yip.id));
    let matchedPosts = allPosts.filter(post => yipIDs.has(parseInt(post.getAttribute("id"))));

    allPosts.forEach(post => post.classList.add("hidden"));

    matchedPosts.forEach(post => post.classList.remove("hidden"));

    document.getElementById("search-btn").disabled = true;
  }

  /**
   * Handles the click event on the home button, shows the home view, and
   * resets the search term input.
   */
  function handleHomeButtonClick() {
    let userView = id('user');
    let newView = id('new');
    let homeView = id('home');
    let searchTermInput = id('search-term');

    userView.classList.add('hidden');
    newView.classList.add('hidden');
    homeView.classList.remove('hidden');

    searchTermInput.value = '';

    let cards = qsa(homeView, '.card');
    for (let card of cards) {
      card.classList.remove('hidden');
    }
  }

  /**
   * Handles the click event on a user's name, fetches and displays the yips shared by the user.
   * @param {string} name - The name of the user whose yips are to be displayed.
   */
  function handleUserClick(name) {
    id('home').classList.add('hidden');
    id('new').classList.add('hidden');

    let userView = id('user');
    while (userView.firstChild) {
      userView.removeChild(userView.firstChild);
    }

    userView.classList.remove('hidden');

    fetch(BASE_URL + '/user/' + name)
      .then(statusCheck)
      .then(response => response.json())
      .then(displayUserYips)
      .catch(handleError);
  }

  /**
   * Displays the yips shared by a user.
   * @param {Array} response - An array of yip objects shared by the user.
   */
  function displayUserYips(response) {
    let user = id('user');
    removeAllChildNodes(user);

    let article = gen(user, 'article');
    article.classList.add('single');

    let h2 = gen(article, 'h2');
    h2.textContent = 'Yips shared by ' + response[0].name + ':';

    response.forEach((yip, index) => {
      let pText = gen(article, 'p');
      pText.textContent = 'Yip ' + (index + 1) + ': ' + yip.yip + ' #' + (yip.hashtag || '');
    });
  }

  /**
   * Removes all child nodes from a given parent element.
   * @param {HTMLElement} parent - The parent element from which child
   * nodes are to be removed.
   */
  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  /**
   * Handles the click event on the like button, increments the likes count,
   * and updates the display.
   * @param {Event} event - The click event object.
   */
  function handleLikeClick(event) {
    const card = event.target.closest('.card');
    const id = card.getAttribute('id');
    const pLikes = card.querySelector('.likes');

    fetch(BASE_URL + '/likes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id: id})
    })
      .then(statusCheck)
      .then(response => response.text())
      .then(data => {
        pLikes.textContent = data;
      })
      .catch(handleError);
  }

  /**
   * Handles the click event on the yip button, shows the
   * yip creation view, and hides other views.
   */
  function handleYipButtonClick() {
    id('home').classList.add('hidden');
    id('user').classList.add('hidden');
    id('new').classList.remove('hidden');
  }

  /**
   * Handles the form submit event, creates a new yip,
   * sends it to the server, and displays it on the home page.
   * @param {Event} event - The form submit event object.
   */
  function handleFormSubmit(event) {
    event.preventDefault();
    const name = id('name').value;
    const yip = id('yip').value;

    const payload = {name: name, full: yip};

    fetch(BASE_URL + '/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(statusCheck)
      .then(response => response.json())
      .then(yipData => {
        id('name').value = '';
        id('yip').value = '';

        const home = id('home');
        const newCard = createYipCard(yipData);
        home.prepend(newCard);

        const timeoutConst = 2000;
        setTimeout(() => {
          id('home').classList.remove('hidden');
          id('new').classList.add('hidden');
        }, timeoutConst);
      })
      .catch(handleError);
  }

  /**
   * Creates a complete Yip card with the provided Yip data.
   * @param {Object} yip - The Yip data.
   * @param {string} yip.id - The Yip's unique ID.
   * @param {string} yip.name - The Yipper's name.
   * @param {string} yip.yip - The Yip content.
   * @param {string} yip.hashtag - The Yip's associated hashtag.
   * @param {string} yip.date - The date the Yip was created.
   * @param {number} yip.likes - The number of likes the Yip has received.
   * @returns {HTMLElement} The complete Yip card as an HTML element.
   */
  function createYipCard(yip) {
    let baseElements = createBaseCardElements(yip);

    baseElements.pName.addEventListener('click', function() {
      handleUserClick(yip.name);
    });

    let pYip = document.createElement('p');
    pYip.textContent = yip.yip + " #" + yip.hashtag;
    baseElements.div1.appendChild(pYip);

    let divMeta = document.createElement('div');
    divMeta.classList.add('meta');
    baseElements.card.appendChild(divMeta);

    let pDate = document.createElement('p');
    pDate.textContent = new Date(yip.date).toLocaleString();
    divMeta.appendChild(pDate);

    let divLike = document.createElement('div');
    divLike.id = yip.id;
    divMeta.appendChild(divLike);

    let imgHeart = document.createElement('img');
    imgHeart.src = 'img/heart.png';
    imgHeart.alt = "heart";
    imgHeart.addEventListener('click', handleLikeClick);
    divLike.appendChild(imgHeart);

    let pLikes = document.createElement('p');
    pLikes.textContent = yip.likes;
    pLikes.classList.add('likes');
    divLike.appendChild(pLikes);

    return baseElements.card;
  }

  /**
   * Creates and returns the base elements needed for a Yip card.
   * @param {Object} yip - An object representing a Yipper.
   * @param {string} yip.id - The ID of the Yipper.
   * @param {string} yip.name - The name of the Yipper.
   * @returns {Object} - An object containing the created elements.
   * @returns {HTMLElement} .card - The 'article' HTML element that represents the card.
   * @returns {HTMLElement} .img - The 'img' HTML element that represents the Yipper's image.
   * @returns {HTMLElement} .div1 - A 'div' HTML element appended to the card.
   * @returns {HTMLElement} .pName - A 'p' HTML element containing the Yipper's name,
   * appended to 'div1'.
   */
  function createBaseCardElements(yip) {
    let card = document.createElement('article');
    card.classList.add('card');
    card.id = yip.id;

    let img = document.createElement('img');
    img.src = 'img/' + yip.name.toLowerCase().replace(/ /g, '-') + '.png';
    img.alt = "Photo of a Yipper";
    card.appendChild(img);

    let div1 = document.createElement('div');
    card.appendChild(div1);

    let pName = document.createElement('p');
    pName.classList.add('individual');
    pName.textContent = yip.name;
    div1.appendChild(pName);

    return {card, img, div1, pName};
  }

  /**
   * Handles errors that occur during the execution of fetch
   * requests or other operations.
   */
  function handleError() {
    let navigation = document.querySelector("nav");
    let allButtons = navigation.querySelectorAll("button");
    id("yipper-data").classList.add("hidden");
    id("error").classList.remove("hidden");

    Array.from(allButtons).forEach((button) => {
      button.disabled = true;
    });
  }

  /**
   * Checks the status of the fetch response and throws an error if the response is not ok.
   * @param {Response} response - The fetch response object.
   * @returns {Response} - The fetch response object if the response is ok.
   * @throws {Error} - If the response is not ok.
   */
  function statusCheck(response) {
    if (!response.ok) {
      throw new Error(console.error());
    }
    return response;
  }

  /**
   * Returns the element with the specified id.
   * @param {string} id - The id of the element to be retrieved.
   * @returns {HTMLElement} - The element with the specified id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns all matching child elements within the given parent element
   * using the specified selector.
   * @param {HTMLElement} parent - The parent element
   * @param {string} selector - The CSS selector for the desired child elements.
   * @returns {NodeList} - A collection of matching child elements.
   */
  function qsa(parent, selector) {
    return parent.querySelectorAll(selector);
  }

  /**
   * Generates a new HTML element with the specified element type
   * and appends it to the given parent element.
   * @param {HTMLElement} parent - The parent element to which the new element will be appended.
   * @param {string} element - The type of the HTML element to be generated.
   * @returns {HTMLElement} - The newly created HTML element.
   */
  function gen(parent, element) {
    let elem = document.createElement(element);
    parent.appendChild(elem);
    return elem;
  }

})();
