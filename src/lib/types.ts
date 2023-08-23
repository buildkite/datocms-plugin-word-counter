export type CountObject = {
  words: number
  wordsExcludingHTMLElements: number
  characters: number
  charactersExcludingSpaces: number
  charactersExcludingHTMLElements: number
  charactersExcludingSpacesAndHTMLElements: number
  specialCharacters: number
  specialCharactersExcludingSpaces: number
  specialCharactersExcludingHTMLElements: number
  specialCharactersExcludingSpacesAndHTMLElements: number
  sentences: number
  paragraphs: number
  readingTime: string
}

export type SavingCountObject = Pick<
  CountObject,
  | 'words'
  | 'characters'
  | 'specialCharacters'
  | 'sentences'
  | 'paragraphs'
  | 'readingTime'
> & {
  settings: {
    includeSpace: boolean
    includeHTML: boolean
  }
}

export type SettingOption = {
  value: string
  label: string
}

export type Parameters = {
  calculationsToShow?: SettingOption[]
  includeSpace?: SettingOption
  includeHTML?: SettingOption
  exposedWordCounterFieldId?: string
}

export interface GlobalParameters extends Parameters {
  autoApply?: boolean
  fieldsToEnable?: SettingOption[]
}

export enum Fields {
  stringField = 'string',
  textField = 'text',
  structuredTextField = 'structured_text',
  jsonField = 'json',
}
