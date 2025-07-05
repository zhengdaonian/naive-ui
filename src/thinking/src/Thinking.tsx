import type { CSSProperties, ExtractPublicPropTypes, PropType } from 'vue'
import type { ThemeProps } from '../../_mixins'
import type { ThinkingTheme } from '../styles/light'
import { NCollapseTransition } from 'naive-ui'
import { pxfy } from 'seemly'
import { computed, defineComponent, h, ref } from 'vue'
import { useConfig, useTheme, useThemeClass } from '../../_mixins'
import { resolveSlot } from '../../_utils'
import thinkingLight from '../styles/light'
import style from './styles/index.cssr'

export const thinkingProps = {
  ...(useTheme.props as ThemeProps<ThinkingTheme>),
  content: {
    type: String,
    default: ''
  },
  splitters: {
    type: String,
    default: '/([. 。？！]+)(?![A-Za-z0-9])/'
  },
  gap: [String, Number] as PropType<string | number>
}

export type ThinkingProps = ExtractPublicPropTypes<typeof thinkingProps>

export default defineComponent({
  name: 'Thinking',
  props: thinkingProps,
  setup(props) {
    const { inlineThemeDisabled, mergedClsPrefixRef } = useConfig(props)
    const themeRef = useTheme(
      'Thinking',
      '-thinking',
      style,
      thinkingLight,
      props,
      mergedClsPrefixRef
    )

    const cssVarsRef = computed(() => {
      const { gap: propGap } = props
      const {
        common: { cubicBezierEaseInOut },
        self: {
          gap,
          textColor,
          lineHeight,
          borderColor,
          colorTertiary,
          colorTertiaryHover
        }
      } = themeRef.value
      return {
        '--n-bezier': cubicBezierEaseInOut,
        '--n-text-color': textColor,
        '--n-line-height': lineHeight,
        '--n-prefix-color': borderColor,
        '--n-color': colorTertiary,
        '--n-color-hover': colorTertiaryHover,
        '--n-gap':
          propGap === undefined
            ? gap
            : typeof propGap === 'number'
              ? pxfy(propGap)
              : propGap
      }
    })

    const themeClassHandle = inlineThemeDisabled
      ? useThemeClass('Thinking', undefined, cssVarsRef, props)
      : undefined

    const showRef = ref(true)

    const handleChangeShow = () => {
      showRef.value = !showRef.value
    }

    const processedContent = computed(() => {
      const { content, splitters } = props
      if (!content)
        return []

      try {
        const regexPattern = splitters.replace(/^\/|\/[gimuy]*$/g, '')
        const regex = new RegExp(regexPattern, 'g')
        const parts = content.split(regex)
        const result = []

        for (let i = 0; i < parts.length; i += 2) {
          const text = parts[i]?.trim()
          const separator = parts[i + 1] || ''

          if (text) {
            result.push({
              text: text + separator,
              index: result.length + 1
            })
          }
        }
        return result
      }
      catch (error) {
        console.warn('Invalid splitters regex:', splitters, error)
        return [
          {
            text: content,
            index: 1
          }
        ]
      }
    })

    return {
      mergedTheme: themeRef,
      mergedClsPrefix: mergedClsPrefixRef,
      cssVars: inlineThemeDisabled ? undefined : cssVarsRef,
      themeClass: themeClassHandle?.themeClass,
      showRef,
      handleChangeShow,
      processedContent
    }
  },
  render() {
    const { mergedClsPrefix, showRef, handleChangeShow, processedContent }
      = this
    return (
      <div
        class={[`${mergedClsPrefix}-thinking`, this.themeClass]}
        style={this.cssVars as CSSProperties}
      >
        <div
          class={`${mergedClsPrefix}-thinking__header`}
          onClick={handleChangeShow}
        >
          <span>thinking...</span>
        </div>
        <NCollapseTransition
          class={`${mergedClsPrefix}-thinking__content`}
          show={showRef}
        >
          {{
            default: () => (
              <blockquote
                class={`${mergedClsPrefix}-thinking__content--wrapper`}
              >
                {processedContent.map(
                  (item: { text: string, index: number }, index: number) => (
                    <div
                      key={index}
                      class={`${mergedClsPrefix}-thinking__line`}
                    >
                      <span class={`${mergedClsPrefix}-thinking__line-text`}>
                        {item.text}
                      </span>
                    </div>
                  )
                )}
              </blockquote>
            )
          }}
        </NCollapseTransition>
      </div>
    )
  }
})
