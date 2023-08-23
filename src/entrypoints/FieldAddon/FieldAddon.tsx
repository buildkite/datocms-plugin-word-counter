import { Fragment, useState, useMemo, useCallback, useEffect } from 'react'
import get from 'lodash/get'
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import {
  Canvas,
  SwitchField,
  CaretDownIcon,
  CaretUpIcon,
} from 'datocms-react-ui'

import StatsList from '../../components/StatsList'

import {
  wordsPerMinute,
  spaceConstants,
  calculationsConstants,
  calculationsOptions,
  spaceOptions,
  htmlConstants,
  htmlOptions,
  defaultExposedWordCounterFieldId,
} from '../../lib/constants'
import {
  Fields,
  CountObject,
  SavingCountObject,
  SettingOption,
  Parameters,
  GlobalParameters,
} from '../../lib/types'
import counter from '../../lib/counter'
import { objectsAreEqual } from '../../lib/helpers'
import { structuredTextToString } from '../../lib/structured-text-helpers'

import styles from './FieldAddon.module.css'

type Props = {
  ctx: RenderFieldExtensionCtx
}

export default function FieldAddon({ ctx }: Props) {
  const pluginGlobalParameters: GlobalParameters =
    ctx.plugin.attributes.parameters
  const pluginParameters: Parameters = ctx.parameters
  const fieldKey: string = ctx.field.attributes.api_key
  const locale: string = ctx.locale

  const exposedWordCounterFieldId: Parameters['exposedWordCounterFieldId'] =
    pluginParameters?.exposedWordCounterFieldId ||
    `${fieldKey}_${defaultExposedWordCounterFieldId}`
  const hasExposedWordCounterField: boolean =
    ctx.formValues[exposedWordCounterFieldId] !== undefined

  const validationLength: any = ctx.field.attributes.validators?.length

  const calculationsSettings: SettingOption[] =
    pluginParameters?.calculationsToShow ||
    pluginGlobalParameters?.calculationsToShow ||
    calculationsOptions
  const spaceSettings: SettingOption =
    pluginParameters?.includeSpace ||
    pluginGlobalParameters?.includeSpace ||
    spaceOptions[0]
  const htmlSettings: SettingOption =
    pluginParameters?.includeHTML ||
    pluginGlobalParameters?.includeHTML ||
    htmlOptions[0]

  const fieldValue: any = get(ctx.formValues, ctx.fieldPath)
  const fieldValueString: string =
    ctx.field.attributes.field_type === Fields.structuredTextField
      ? structuredTextToString(fieldValue)
      : String(fieldValue)

  const fieldStats: CountObject = counter(fieldValueString)

  const wordCounterField: any = useMemo(() => {
    if (hasExposedWordCounterField) {
      const fields: any[] = Object.entries(ctx.fields).map(
        ([_, field]) => field,
      )
      const wordCounterField: any = fields.find(
        (field) => field.attributes.api_key === exposedWordCounterFieldId,
      )
      return wordCounterField
    }
    return
  }, [ctx, exposedWordCounterFieldId, hasExposedWordCounterField])

  const wordCounterFieldIsJson: boolean = useMemo(() => {
    const isJsonField: boolean =
      wordCounterField?.attributes.field_type === Fields.jsonField
    return isJsonField
  }, [wordCounterField])

  const wordCounterFieldIsLocalized: boolean = useMemo(() => {
    const isLocalized: boolean = wordCounterField?.attributes.localized
    return isLocalized
  }, [wordCounterField])

  const exposedWordCounter: SavingCountObject | undefined = useMemo(() => {
    if (wordCounterFieldIsJson) {
      const wordCounterPath: string = wordCounterFieldIsLocalized
        ? `${exposedWordCounterFieldId}.${locale}`
        : exposedWordCounterFieldId

      ctx.toggleField(wordCounterPath, false)

      const fullExposedWordCounter: any = get(
        ctx.formValues,
        exposedWordCounterFieldId,
      )
      const exposedWordCounter: SavingCountObject = wordCounterFieldIsLocalized
        ? JSON.parse(fullExposedWordCounter[locale])
        : JSON.parse(fullExposedWordCounter)

      return exposedWordCounter
    }
    return undefined
  }, [
    ctx,
    locale,
    exposedWordCounterFieldId,
    wordCounterFieldIsJson,
    wordCounterFieldIsLocalized,
  ])

  const saveExposedWordCount = useCallback(
    (newExposedWordCounter: SavingCountObject) => {
      // If the exposed word counter field is present, we want to expose the newExposedWordCounter
      if (wordCounterFieldIsJson) {
        const wordCounterPath: string = wordCounterFieldIsLocalized
          ? `${exposedWordCounterFieldId}.${locale}`
          : exposedWordCounterFieldId

        ctx.toggleField(wordCounterPath, false)

        const countsAreEqual = objectsAreEqual(
          exposedWordCounter,
          newExposedWordCounter,
        )

        if (!countsAreEqual) {
          ctx.setFieldValue(
            wordCounterPath,
            JSON.stringify(newExposedWordCounter),
          )
        }
      }
    },
    [
      ctx,
      locale,
      exposedWordCounterFieldId,
      wordCounterFieldIsJson,
      exposedWordCounter,
      wordCounterFieldIsLocalized,
    ],
  )

  const showSpacesSwitch: boolean = useMemo(() => {
    return (
      spaceSettings.value !== spaceConstants.includeSpaces &&
      spaceSettings.value !== spaceConstants.excludeSpaces &&
      calculationsSettings.some(
        (setting) =>
          setting.value === calculationsConstants.numberOfCharacters ||
          setting.value === calculationsConstants.numberOfSpecialCharacters,
      )
    )
  }, [spaceSettings, calculationsSettings])

  const showHTMLSwitch: boolean = useMemo(() => {
    return (
      htmlSettings.value !== htmlConstants.includeHTML &&
      htmlSettings.value !== htmlConstants.excludeHTML &&
      calculationsSettings.some(
        (setting) =>
          setting.value === calculationsConstants.numberOfCharacters ||
          setting.value === calculationsConstants.numberOfSpecialCharacters,
      )
    )
  }, [htmlSettings, calculationsSettings])

  const [showSpaces, setShowSpaces] = useState<boolean>(
    showSpacesSwitch
      ? exposedWordCounter?.settings?.includeSpace || false
      : spaceSettings.value === spaceConstants.includeSpaces &&
          spaceSettings.value !== spaceConstants.excludeSpaces,
  )
  const [showHTML, setShowHTML] = useState<boolean>(
    showHTMLSwitch
      ? exposedWordCounter?.settings?.includeHTML || false
      : htmlSettings.value === htmlConstants.includeHTML &&
          htmlSettings.value !== htmlConstants.excludeHTML,
  )
  const [showInfo, setShowInfo] = useState<boolean>(false)

  const wordCount: SavingCountObject = useMemo(() => {
    const {
      words,
      characters,
      specialCharacters,
      sentences,
      paragraphs,
      readingTime,
    } = fieldStats

    const defaultStats: SavingCountObject = {
      words,
      characters,
      specialCharacters,
      sentences,
      paragraphs,
      readingTime,
      settings: {
        includeSpace: showSpaces,
        includeHTML: showHTML,
      },
    }

    if (!showSpaces && !showHTML) {
      return {
        ...defaultStats,
        characters: fieldStats.charactersExcludingSpacesAndHTMLElements,
        specialCharacters:
          fieldStats.specialCharactersExcludingSpacesAndHTMLElements,
        words: fieldStats.wordsExcludingHTMLElements,
      }
    }

    if (!showSpaces) {
      return {
        ...defaultStats,
        characters: fieldStats.charactersExcludingSpaces,
        specialCharacters: fieldStats.specialCharactersExcludingSpaces,
      }
    }

    if (!showHTML) {
      return {
        ...defaultStats,
        words: fieldStats.wordsExcludingHTMLElements,
        characters: fieldStats.charactersExcludingHTMLElements,
        specialCharacters: fieldStats.specialCharactersExcludingHTMLElements,
      }
    }

    return defaultStats
  }, [showSpaces, showHTML, fieldStats])

  useEffect(() => {
    saveExposedWordCount(wordCount)
  }, [saveExposedWordCount, wordCount])

  if (calculationsSettings.length === 0) {
    return (
      <Canvas ctx={ctx}>
        <p className="body">
          Words: <span className="text-bold">{wordCount.words}</span>
        </p>
      </Canvas>
    )
  }

  return (
    <Canvas ctx={ctx}>
      {!showInfo && (
        <button className={styles.button} onClick={() => setShowInfo(true)}>
          <CaretDownIcon
            className={`${styles.buttonIcon} ${
              fieldStats.characters > validationLength?.max ||
              fieldStats.characters < validationLength?.min
                ? styles.buttonIconError
                : ''
            }`.trim()}
          />
          <span className="body">
            Words: <span className="text-bold">{wordCount.words}</span>
          </span>
        </button>
      )}

      {showInfo && (
        <>
          <StatsList>
            <dt>
              <button
                className={styles.button}
                onClick={() => {
                  setShowInfo(false)
                  setTimeout(() => {
                    ctx.updateHeight(0)
                  }, 1)
                }}
              >
                <CaretUpIcon
                  className={`${styles.buttonIcon} ${
                    fieldStats.characters > validationLength?.max ||
                    fieldStats.characters < validationLength?.min
                      ? styles.buttonIconError
                      : ''
                  }`.trim()}
                />
                <span className="body">Words</span>
              </button>
            </dt>
            <dd>{wordCount.words}</dd>

            {calculationsSettings.some(
              (setting) =>
                setting.value === calculationsConstants.numberOfCharacters,
            ) ? (
              <>
                <dt>Characters</dt>
                <dd>
                  <span
                    className={
                      fieldStats.characters > validationLength?.max ||
                      fieldStats.characters < validationLength?.min
                        ? ' text-error'
                        : ''
                    }
                  >
                    {wordCount.characters}
                    {validationLength?.max &&
                      (validationLength?.min
                        ? fieldStats.characters >= validationLength?.min
                        : true) && (
                        <>
                          {' '}
                          {showSpaces ? (
                            <span className="body--medium">
                              / {validationLength?.max}
                            </span>
                          ) : (
                            <span className="body--medium">
                              ({fieldStats.characters} / {validationLength?.max}
                              )
                            </span>
                          )}
                        </>
                      )}
                    {validationLength?.min &&
                      fieldStats.characters < validationLength?.min && (
                        <>
                          {' '}
                          <span className="body--medium">
                            ({validationLength?.min - fieldStats.characters}{' '}
                            characters needed)
                          </span>
                        </>
                      )}
                  </span>
                </dd>
              </>
            ) : (
              <></>
            )}

            {calculationsSettings.some(
              (setting) =>
                setting.value ===
                calculationsConstants.numberOfSpecialCharacters,
            ) ? (
              <>
                <dt>Special characters</dt>
                <dd>{wordCount.specialCharacters}</dd>
              </>
            ) : (
              <></>
            )}

            {calculationsSettings.some(
              (setting) =>
                setting.value === calculationsConstants.numberOfSentences,
            ) ? (
              <>
                <dt>Sentences</dt>
                <dd>{wordCount.sentences}</dd>
              </>
            ) : (
              <></>
            )}

            {calculationsSettings.some(
              (setting) =>
                setting.value === calculationsConstants.numberOfParagraphs,
            ) ? (
              <>
                <dt>Paragraphs</dt>
                <dd>{wordCount.paragraphs}</dd>
              </>
            ) : (
              <></>
            )}

            {calculationsSettings.some(
              (setting) => setting.value === calculationsConstants.readingTime,
            ) ? (
              <>
                <dt>Reading time</dt>
                <dd>
                  <span className={styles.statsListItem}>
                    {wordCount.readingTime}
                  </span>
                  <span
                    className={`${styles.statsListItem} body--small text-thin`}
                  >
                    Based on {wordsPerMinute} words per minute
                  </span>
                </dd>
              </>
            ) : (
              <></>
            )}
          </StatsList>

          {showSpacesSwitch && (
            <div className={styles.switchField}>
              <SwitchField
                id="showSpaces"
                name="showSpaces"
                label="Include spaces"
                value={showSpaces}
                onChange={() => setShowSpaces(!showSpaces)}
              />
            </div>
          )}

          {showHTMLSwitch && (
            <div className={styles.switchField}>
              <SwitchField
                id="showHTML"
                name="showHTML"
                label="Include HTML elements"
                value={showHTML}
                onChange={() => setShowHTML(!showHTML)}
              />
            </div>
          )}
        </>
      )}
    </Canvas>
  )
}
