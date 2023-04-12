const accessToken = '3796899bd37c423bad3a21a25277bce0';
const baseUrl = 'http://127.0.0.1:5000/chat';
const loader = `<span class='loader'><span class='loader__dot'></span><span class='loader__dot'></span><span class='loader__dot'></span></span>`;
const errorMessage = 'My apologies, I\'m not available at the moment, however, feel free to call our support team directly 0123456789.';
const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
const $document = document;
const $chatbot = $document.querySelector('.chatbot');
const $chatbotMessageWindow = $document.querySelector('.chatbot__message-window');
const $chatbotHeader = $document.querySelector('.chatbot__header');
const $chatbotMessages = $document.querySelector('.chatbot__messages');
const $chatbotInput = $document.querySelector('.chatbot__input');
const $chatbotSubmit = $document.querySelector('.chatbot__submit');

document.addEventListener('keypress', event => {
  if (event.which == 13) validateMessage();
}, false);

$chatbotHeader.addEventListener('click', () => {
  toggle($chatbot, 'chatbot--closed');
  $chatbotInput.focus();
}, false);

$chatbotSubmit.addEventListener('click', () => {
  validateMessage();
}, false);

const validateMessage = () => {
  const text = $chatbotInput.value
  const safeText = text ? escapeScript(text) : ''
  if (safeText.length && safeText !== ' ') {
    resetInputField()
    userMessage(safeText)
    send(includeDicommContext(safeText));
  }
  scrollDown()
  return
}

const escapeScript = unsafe => {
  const safeString = unsafe
    .replace(/</g, ' ')
    .replace(/>/g, ' ')
    .replace(/&/g, ' ')
    .replace(/"/g, ' ')
    .replace(/\\/, ' ')
    .replace(/\s+/g, ' ')
  return safeString.trim()
}

const includeDicommContext = (safeText) => {
  return /dicomm|mccann|developer|coder|artfulprogrammer|developed|goal/i.test(safeText) ? safeText : safeText + " Dicomm McCann";

}

const toggle = (element, klass) => {
  const classes = element.className.match(/\S+/g) || [],
    index = classes.indexOf(klass);
  index >= 0 ? classes.splice(index, 1) : classes.push(klass);
  element.className = classes.join(' ');
};

const userMessage = content => {
  $chatbotMessages.innerHTML += `<li class='is-user animation'>
      <p class='chatbot__message'>
        ${content}
      </p>
      <span class='chatbot__arrow chatbot__arrow--right'></span>
    </li>`;
};

const aiMessage = (content, isLoading = false) => {
    removeLoader();
    $chatbotMessages.innerHTML += `<li 
      class='is-ai animation' 
      id='${isLoading ? "is-loading" : ""}'>
        <div class="is-ai__profile-picture">
          <svg class="icon-avatar" viewBox="0 0 32 32">
            <use xlink:href="#avatar" />
          </svg>
        </div>
        <span class='chatbot__arrow chatbot__arrow--left'></span>
        <div class='chatbot__message'>${content}</div>
      </li>`;
    scrollDown();
};

const removeLoader = () => {
  let loadingElem = document.getElementById('is-loading');
  if (loadingElem) $chatbotMessages.removeChild(loadingElem);
};

const processResponse = (str) => {
  const firstNewLineIndex = str.indexOf('\n');
  if (firstNewLineIndex === -1) {
    return str;
  }
  const firstLine = str.slice(0, firstNewLineIndex);
  const restOfStr = str.slice(firstNewLineIndex + 1);
  const newRestOfStr = restOfStr.replace(/\n/g, '<br>');
  return `${firstLine}\n${newRestOfStr}`;
}

const setResponse = (val) => {
    aiMessage(processResponse(val), false);
};

const resetInputField = () => {
  $chatbotInput.value = '';
};

const scrollDown = () => {
  const distanceToScroll =
    $chatbotMessageWindow.scrollHeight - (
      $chatbotMessages.lastChild.offsetHeight + 60);
  $chatbotMessageWindow.scrollTop = distanceToScroll;
  return false;
};

const send = (text) => {
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: text })
  }).
    then(response => response.json()).
    then(res => {
      if (res.status < 200 || res.status >= 300) {
        let error = new Error(res.statusText);
        throw error;
      }
      return res;
    }).
    then(res => {
      setResponse(res.data);
    }).
    catch(error => {
      setResponse(errorMessage);
      resetInputField();
      console.log(error);
    });

  aiMessage(loader, true);
};