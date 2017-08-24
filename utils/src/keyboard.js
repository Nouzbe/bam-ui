const isNumeric = keyCode => (keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105);

const isAlphabetic = keyCode => keyCode >= 65 && keyCode <= 90;

const isAlphaNumeric = keyCode => isNumeric(keyCode) || isAlphabetic(keyCode);

const isEscape = e => e.keyCode === 27;

const isTab = e => e.keyCode === 9;

const isEnter = e => e.keyCode === 13;

const isLeftArrow = e => e.keyCode === 37;

const isRightArrow = e => e.keyCode === 39;

const isUpArrow = e => e.keyCode === 38;

const isDownArrow = e => e.keyCode === 40;

const isPageDown = e => e.keyCode === 34;

const isPageUp = e => e.keyCode === 33;

const isHome = e => e.keyCode === 36;

const isEnd = e => e.keyCode === 35;

const isCopy = event => event.ctrlKey && event.keyCode === 67;

const isCut = event => event.ctrlKey && event.keyCode === 88;

const isPaste = event => event.ctrlKey && event.keyCode === 86;

const isDelete = event => event.keyCode === 46;

const getCharacter = event => event.shiftKey ? String.fromCharCode(event.keyCode) : String.fromCharCode(event.keyCode).toLowerCase();

export default {
    isNumeric,
    isAlphabetic,
    isAlphaNumeric,
    isEscape,
    isTab,
    isEnter,
    isCopy,
    isCut,
    isPaste,
    isDelete,
    getCharacter,
    isLeftArrow,
    isRightArrow,
    isUpArrow,
    isDownArrow,
    isHome,
    isEnd,
    isPageUp,
    isPageDown
};