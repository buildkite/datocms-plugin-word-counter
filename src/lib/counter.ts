import { CountObject } from './types'
import { wordsPerMinute, htmlElements } from './constants'

export default function counter(string: string): CountObject {
  const stringExcludingSpaces = string.replace(/\s/g, '')
  const htmlElementsString = htmlElements.join('|')
  const htmlRegex = new RegExp(`</?(${htmlElementsString})>`, 'gi')
  const stringExcludingHTMLElements = string.replace(htmlRegex, '')
  const stringExcludingSpacesAndHTMLElements = string
    .replace(/\s/g, '')
    .replace(htmlRegex, '')

  return {
    words: wordCounter(string),
    wordsExcludingHTMLElements: wordCounter(stringExcludingHTMLElements),
    characters: string.length,
    charactersExcludingSpaces: stringExcludingSpaces.length,
    charactersExcludingHTMLElements: stringExcludingHTMLElements.length,
    charactersExcludingSpacesAndHTMLElements:
      stringExcludingSpacesAndHTMLElements.length,
    specialCharacters: specialCharacterCounter(string),
    specialCharactersExcludingSpaces: specialCharacterCounter(
      stringExcludingSpaces,
    ),
    specialCharactersExcludingHTMLElements: specialCharacterCounter(
      stringExcludingHTMLElements,
    ),
    specialCharactersExcludingSpacesAndHTMLElements: specialCharacterCounter(
      stringExcludingSpacesAndHTMLElements,
    ),
    sentences: sentencesCounter(string),
    paragraphs: paragraphsCounter(string),
    readingTime: readingTimeCounter(string),
  }
}

function wordCounter(string: string): number {
  const wordRegex = /[ \n]/
  const words = string.split(wordRegex).filter(hasNoSpace)
  return words.length
}

function specialCharacterCounter(string: string): number {
  let specialCharacters = 0

  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i)
    if (
      (code < 47 || code > 58) && // != numeric (0-9)
      (code < 64 || code > 91) && // != upper alpha (A-Z)
      (code < 96 || code > 123)
    ) {
      // != lower alpha (a-z)
      specialCharacters++
    }
  }

  return specialCharacters
}

function sentencesCounter(string: string): number {
  const sentenceRegex = /[.!?\n]/
  const sentences = string.split(sentenceRegex).filter(hasNoSpace)
  return sentences.length
}

function paragraphsCounter(string: string): number {
  const paragraphRegex = /[\n]/
  const paragraphs = string.split(paragraphRegex).filter(hasNoSpace)
  return paragraphs.length
}

function readingTimeCounter(string: string): string {
  const numberOfWords = wordCounter(string)
  const readingTimePerMinute = numberOfWords / wordsPerMinute

  if (readingTimePerMinute === 0) {
    return '0 seconds'
  }

  if (readingTimePerMinute < 0.95) {
    const readingTimePerSecond = (readingTimePerMinute * 60) % 60

    if (readingTimePerSecond >= 1 && readingTimePerSecond < 2) {
      return '1 second'
    } else if (readingTimePerSecond >= 2) {
      return `${Math.floor(readingTimePerSecond)} seconds`
    }

    return '< 1 second'
  } else if (readingTimePerMinute >= 0.95 && readingTimePerMinute <= 1.5) {
    return '1 minute'
  }

  return `${Math.ceil(readingTimePerMinute)} minutes`
}

function hasNoSpace(word: string): boolean {
  return word !== ' ' && word !== ''
}
