/*
 * Name: Soham Raut
 * Date: May 6, 2022
 * Section: CSE 154 AF
 * This is the index.js page used to add functionality to the Evil Typing Test.
 * It is used to add button functions, modify the elements on the page, keep track of a timer,
 * and to get data from the FakerAPI to use it in the test.
 */
"use strict";

(function() {
  const TEXT_URL = "https://fakerapi.it/api/v1/texts?_quantity=1";
  const CHARACTERS = 500;

  let timerId;
  let secondsPassed;
  let text;

  window.addEventListener("load", init);

  /**
   * Sets up the start button and the input area
   */
  function init() {
    id("start").addEventListener("click", getText);
    secondsPassed = 0;
    text = "";
    id("input-text").addEventListener('input', checkInput);
    id("input-text").addEventListener('paste', pasteInput);
  }

  /**
   * Retrieves data from the FakerAPI and starts the test in case of no error
   */
  function getText() {
    id("start").removeEventListener('click', getText);
    id("start").disabled = true;
    fetch(TEXT_URL + "&_characters=" + CHARACTERS)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(startGame)
      .catch(handleError);
  }

  /**
   * Starts the test by starting the timer and displaying the text to be typed
   * and hides the introduction portion of the page.
   * @param {Object} responseData : The response object returned on retrieving data from FakerAPI
   */
  function startGame(responseData) {
    qs("header").classList.add("hidden");
    id("intro").classList.add("hidden");
    id("game").classList.remove("hidden");
    id("input-text").value = "";
    text = responseData.data[0].content;
    createPara(text);
    timerId = setInterval(updateTime, 1000);
  }

  /**
   * Creates a text paragraph containing the text to be typed by the user and displays it on the
   * page.
   * @param {String} content : The content of the paragraph to be created
   */
  function createPara(content) {
    if (qs("#game-text p")) {
      id("game-text").innerHTML = "";
    }
    let para = gen("p");
    para.textContent = content;
    id("game-text").appendChild(para);
  }

  /**
   * Checks user input every time it changes, and updates the text paragraph accordingly by
   * separating the portion entered correctly and the remaining portion. Ends the game if the user
   * types the entire paragraph correctly.
   */
  function checkInput() {
    let input = id("input-text").value;
    let i = 0;
    while (i < text.length && text[i] === input[i]) {
      i++;
    }
    if (input !== text) {
      let correct = gen("span");
      correct.id = "correct";
      correct.textContent = input.substring(0, i);
      id("game-text").innerHTML = "";
      id("game-text").appendChild(correct);
      createPara(text.substring(i, text.length));
    } else {
      setTimeout(endGame, 1000);
    }
  }

  /**
   * Returns the number of minutes passed since the start of the game
   * @returns {Number} : the number of minutes passed
   */
  function getMinutes() {
    return (secondsPassed - (secondsPassed % 60)) / 60;
  }

  /**
   * Updates the time passed and displays it on the screen
   */
  function updateTime() {
    secondsPassed++;
    let minutes = getMinutes();
    let time = "0" + minutes + ":";
    if ((secondsPassed % 60) < 10) {
      time = time + "0";
    }
    time = time + (secondsPassed % 60);
    id("time").textContent = time;
  }

  /**
   * Clears the text input area and shows a message if the user tries to paste data into it.
   */
  function pasteInput() {
    let gameText = id("input-text");
    gameText.disabled = true;
    gameText.value = "No cheating :(";
    setTimeout(() => {
      gameText.disabled = false;
      gameText.value = "";
    }, 2000);
  }

  /**
   * Ends the current game/test and displays the results.
   * Ends and starts a new game if the user wishes to play again.
   */
  function endGame() {
    clearInterval(timerId);
    if (this.id !== "again") {
      displayResults();
    } else {
      secondsPassed = 0;
      updateTime();
      id("results").classList.add("hidden");
      getText();
    }
  }

  /**
   * Calculates and displays the results of the typing test.
   * Displays the characters and words per minute typed by the user.
   */
  function displayResults() {
    id("game").classList.toggle("hidden");
    id("results").classList.toggle("hidden");
    let minutes = getMinutes();
    if (minutes === 0) {
      minutes = secondsPassed / 60;
    }
    let charsPerMin = Math.round(CHARACTERS / minutes);
    let wordsPerMin = Math.round(text.split(" ").length / minutes);
    id("chars-per-min").textContent = charsPerMin;
    id("words-per-min").textContent = wordsPerMin;
    id("again").addEventListener('click', endGame);
  }

  /**
   * Displays a message on the screen in case of errors.
   */
  function handleError() {
    if (!id("error")) {
      let error = gen("p");
      error.id = "error";
      error.textContent = "Looks like something went wrong. Refresh the page and try again.";
      id("intro").appendChild(error);
      id("start").disabled = true;
    }
  }

  /**
   * Checks the status of the data requested from the API, throws an error if there are problems.
   * @param {Promise} res : The response object after data is requested
   * @returns {Promise} : The response object passed (if there are no problems)
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element with the passed ID value
   * @param {string} idName : The id of the element
   * @returns {Element} : The object associated with the passed id
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element that matches the passed CSS selector
   * @param {string} selector : One or more CSS selectors to select elements
   * @returns {Element} : The first element matching the given selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns a new element with the passed tag name
   * @param {string} tagName : The tag name for the new DOM element
   * @returns {Element} : a new element with the given tag name
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();