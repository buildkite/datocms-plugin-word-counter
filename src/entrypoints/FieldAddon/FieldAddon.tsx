import { Fragment, useState, useMemo } from 'react'
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
  spaceConstants,
  calculationsConstants,
  calculationsOptions,
  spaceOptions,
} from '../../lib/constants'
import {
  CountObject,
  SettingOption,
  Parameters,
  GlobalParameters,
} from '../../lib/types'
import counter from '../../lib/counter'
import styles from './FieldAddon.module.css'

type Props = {
  ctx: RenderFieldExtensionCtx
}

export default function FieldAddon({ ctx }: Props) {
  const pluginGlobalParameters: GlobalParameters =
    ctx.plugin.attributes.parameters
  const pluginParameters: Parameters = ctx.parameters

  const calculationsSettings: SettingOption[] =
    pluginParameters?.calculationsToShow ||
    pluginGlobalParameters?.calculationsToShow ||
    calculationsOptions
  const spaceSettings: SettingOption =
    pluginParameters?.includeSpace ||
    pluginGlobalParameters?.includeSpace ||
    spaceOptions[0]

  const fieldValue: string = String(get(ctx.formValues, ctx.fieldPath))
  const fieldStats: CountObject = counter(fieldValue)

  const [showSpaces, setShowSpaces] = useState<boolean>(
    spaceSettings.value === spaceConstants.includeSpaces &&
      spaceSettings.value !== spaceConstants.excludeSpaces
  )
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const [showCommonWords, setShowCommonWords] = useState<boolean>(false)

  const showSpacesSwitch: boolean = useMemo(() => {
    return (
      spaceSettings.value !== spaceConstants.includeSpaces &&
      spaceSettings.value !== spaceConstants.excludeSpaces &&
      calculationsSettings.some(
        (setting) =>
          setting.value === calculationsConstants.numberOfCharacters ||
          setting.value === calculationsConstants.numberOfSpecialCharacters
      )
    )
  }, [spaceSettings, calculationsSettings])

  if (calculationsSettings.length === 0) {
    return (
      <Canvas ctx={ctx}>
        <p className="body">
          Words: <span className="text-bold">{fieldStats.words}</span>
        </p>
      </Canvas>
    )
  }

  return (
    <Canvas ctx={ctx}>
      {!showInfo && (
        <button className={styles.button} onClick={() => setShowInfo(true)}>
          <CaretDownIcon className={styles.buttonIcon} />
          <span className="body">
            Words: <span className="text-bold">{fieldStats.words}</span>
          </span>
        </button>
      )}

      {showInfo && (
        <>
          <StatsList>
            <dt>
              <button
                className={styles.button}
                onClick={() => setShowInfo(false)}
              >
                <CaretUpIcon className={styles.buttonIcon} />
                <span className="body">Words</span>
              </button>
            </dt>
            <dd>{fieldStats.words}</dd>

            {calculationsSettings.some(
              (setting) =>
                setting.value === calculationsConstants.numberOfCharacters
            ) ? (
              <>
                <dt>Characters</dt>
                <dd>
                  {showSpaces
                    ? fieldStats.characters
                    : fieldStats.charactersExcludingSpaces}
                </dd>
              </>
            ) : (
              <></>
            )}

            {calculationsSettings.some(
              (setting) =>
                setting.value ===
                calculationsConstants.numberOfSpecialCharacters
            ) ? (
              <>
                <dt>Special characters</dt>
                <dd>
                  {showSpaces
                    ? fieldStats.specialCharacters
                    : fieldStats.specialCharactersExcludingSpaces}
                </dd>
              </>
            ) : (
              <></>
            )}

            {calculationsSettings.some(
              (setting) =>
                setting.value === calculationsConstants.numberOfSentences
            ) ? (
              <>
                <dt>Sentences</dt>
                <dd>{fieldStats.sentences}</dd>
              </>
            ) : (
              <></>
            )}

            {calculationsSettings.some(
              (setting) =>
                setting.value === calculationsConstants.numberOfParagraphs
            ) ? (
              <>
                <dt>Paragraphs</dt>
                <dd>{fieldStats.paragraphs}</dd>
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

          {Object.keys(fieldStats.commonWords).length > 0 &&
            calculationsSettings.some(
              (setting) =>
                setting.value === calculationsConstants.showCommonWords
            ) && (
              <>
                <button
                  className={styles.button}
                  onClick={() => setShowCommonWords(!showCommonWords)}
                >
                  {showCommonWords ? (
                    <CaretUpIcon className={styles.buttonIcon} />
                  ) : (
                    <CaretDownIcon className={styles.buttonIcon} />
                  )}
                  <span className="h2">
                    {`Common words (${
                      Object.keys(fieldStats.commonWords).length
                    })`}
                  </span>
                </button>

                {showCommonWords && (
                  <StatsList list>
                    {Object.keys(fieldStats.commonWords).map((word) => (
                      <Fragment key={word}>
                        <dt>{word}</dt>
                        <dd>{fieldStats.commonWords[word]}</dd>
                      </Fragment>
                    ))}
                  </StatsList>
                )}
              </>
            )}
        </>
      )}
    </Canvas>
  )
}
