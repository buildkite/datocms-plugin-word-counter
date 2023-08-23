# DatoCMS plugin: Word counter

**This DatoCMS plugin gives you information for text and string fields about word count, character count, sentences, paragraphs, reading time and common words.**

![](https://github.com/voorhoede/datocms-plugin-word-counter/raw/main/docs/word-counter.png)

## Features

* Add to `structured-text`, `string` and `text` fields or your own selection of these fields.
* See count of words, characters, sentences, paragraphs
* See an estimate of the reading time
* See common words
* Full control over the visible calculations
* Be able to choose to add spaces and enters in the calculations
* Expose the count and use it from the API

## Configuration

First add this plugin via DatoCMS Settings > Plugins > Add (`/admin/plugins/new`).

### Plugin settings

For this plugin you can configure global settings and configure the plugin per field. Choose to apply the plugin automatically to all string/text fields or add the plugin as addon per model/field. Settings set per model/field will always overwrite all global settings.

#### **Global Settings**

![](https://github.com/voorhoede/datocms-plugin-word-counter/raw/main/docs/word-counter-global-settings.png)

- **Auto apply to fields (switch)**: When enabled this will automatically apply the plugin to all `structured-text`, `string` and `text` fields.
By changing the following setting you can choose on which fields this plugin will be applied.

- **Field where this plugin is enabled (multi select)**: You can choose to which fields the plugin will be applied.

> Options of `Field where this plugin is enabled`:
> * Structured-text fields
> * String fields
> * text fields

#### **General Settings**

![](https://github.com/voorhoede/datocms-plugin-word-counter/raw/main/docs/word-counter-general-settings.png)

- **Calculations to show (multi select)**: You can choose which calculations will be shown. As default all calculations will be shown. When no calculations are selected the plugin will only show word count on the applied fields.

> Options of `Calculations to show`:
> * Number of characters
> * Number of special characters
> * Number of sentences
> * Number of paragraphs
> * Reading time
> * Show common words

- **Include space (select)**: You can choose if spaces and enters are taken into account in the calculations shown in the plugin. The default `Show switch to toggle spaces` will show a switch to let the user choose themselves.

> Options of `Include space`:
> * Show switch to toggle spaces
> * Always include spaces
> * Never include spaces

- **Include HMTL elements (select)**: You can choose if html elements are taken into account in the calculations shown in the plugin. The default `Show switch to toggle HTML elements` will show a switch to let the user choose themselves.

> Options of `Include HTML elements`:
> * Show switch to HTML elements
> * Always include HTML elements
> * Never include HTML elements

#### **Expose word count**

With this word counter plugin you can expose the word count results in the API. To do this you have to specify a new field in the model where the word counter is implemented. The field that is added will automatically be hidden, but will still be exposed in the API.

- **Exposed word counter field id (text)**: You can use the id of a specific JSON field or leave this blank which will automatically use '{fieldId}_word_counter'

> The field where the stats are being saved has to be a JSON field and make sure the ID isn't used in other fields

![](https://github.com/voorhoede/datocms-plugin-word-counter/raw/main/docs/word-counter-expose.png)

Implementing it like the screenshot will result in:
```javascript
{
  "data": {
    "wordCounterPage": {
      "title": "Page title",
      "titleWordCounter": {
        "words": 2,
        "characters": 10,
        "specialCharacters": 1,
        "sentences": 1,
        "paragraphs": 1,
        "readingTime": "< 1 second",
        "settings": {
          "includeSpace": true,
          "includeHTML": true
        }
      }
    }
  }
}
```

## Contributing

See [contributing.md](https://github.com/voorhoede/datocms-plugin-word-counter/blob/main/contributing.md).
