import type { CNode } from 'css-render'
import type { CSSProperties, PropType, VNode, VNodeChild } from 'vue'
import type { VirtualListInst } from 'vueuc'
import type { ColItem } from '../use-group-header'
import { pxfy, repeat } from 'seemly'
import { useMemo } from 'vooks'
import {
  computed,
  defineComponent,
  Fragment,
  h,
  inject,
  onUnmounted,
  ref,
  watchEffect
} from 'vue'
import { VirtualList, VResizeObserver } from 'vueuc'
import { NScrollbar, type ScrollbarInst } from '../../../_internal'
import { cssrAnchorMetaName } from '../../../_mixins/common'
import { formatLength, resolveSlot, warn } from '../../../_utils'
import { c } from '../../../_utils/cssr'
import { configProviderInjectionKey } from '../../../config-provider/src/context'
import { NEmpty } from '../../../empty'
import {
  type ColumnKey,
  dataTableInjectionKey,
  type MainTableBodyRef,
  type RowData,
  type RowKey,
  type SummaryRowData,
  type TmNode
} from '../interface'
import { createRowClassName, getColKey, isColumnSorting } from '../utils'
import RenderSafeCheckbox from './BodyCheckbox'
import RenderSafeRadio from './BodyRadio'
import Cell from './Cell'
import ExpandTrigger from './ExpandTrigger'
import TableHeader from './Header'

interface StyleCProps {
  leftActiveFixedColKey: ColumnKey | null
  leftActiveFixedChildrenColKeys: ColumnKey[]
  rightActiveFixedColKey: ColumnKey | null
  rightActiveFixedChildrenColKeys: ColumnKey[]
  componentId: string
}

interface NormalRowRenderInfo {
  striped: boolean
  tmNode: TmNode
  key: RowKey
  index: number
}

type RowRenderInfo =
  | {
    isSummaryRow: true
    key: RowKey
    tmNode: {
      rawNode: SummaryRowData
      disabled: boolean
    }
    index: number
  }
  | NormalRowRenderInfo
  | {
    isExpandedRow: true
    tmNode: TmNode
    key: RowKey
    index: number
  }

function flatten(
  rowInfos: NormalRowRenderInfo[],
  expandedRowKeys: Set<RowKey>
): NormalRowRenderInfo[] {
  const fRows: NormalRowRenderInfo[] = []
  function traverse(rs: TmNode[], rootIndex: number): void {
    rs.forEach((r) => {
      if (r.children && expandedRowKeys.has(r.key)) {
        fRows.push({
          tmNode: r,
          striped: false,
          key: r.key,
          index: rootIndex
        })
        traverse(r.children, rootIndex)
      }
      else {
        fRows.push({
          key: r.key,
          tmNode: r,
          striped: false,
          index: rootIndex
        })
      }
    })
  }
  rowInfos.forEach((rowInfo) => {
    fRows.push(rowInfo)
    const { children } = rowInfo.tmNode
    if (children && expandedRowKeys.has(rowInfo.key)) {
      traverse(children, rowInfo.index)
    }
  })
  return fRows
}

const VirtualListItemWrapper = defineComponent({
  props: {
    clsPrefix: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    cols: {
      type: Array as PropType<ColItem[]>,
      required: true
    },
    onMouseenter: Function as PropType<(e: MouseEvent) => void>,
    onMouseleave: Function as PropType<(e: MouseEvent) => void>
  },
  render() {
    const { clsPrefix, id, cols, onMouseenter, onMouseleave } = this
    return (
      <table
        style={{ tableLayout: 'fixed' }}
        class={`${clsPrefix}-data-table-table`}
        onMouseenter={onMouseenter}
        onMouseleave={onMouseleave}
      >
        <colgroup>
          {cols.map(col => (
            <col key={col.key} style={col.style}></col>
          ))}
        </colgroup>
        <tbody data-n-id={id} class={`${clsPrefix}-data-table-tbody`}>
          {this.$slots}
        </tbody>
      </table>
    )
  }
})

export default defineComponent({
  name: 'DataTableBody',
  props: {
    onResize: Function as PropType<(e: ResizeObserverEntry) => void>,
    showHeader: Boolean,
    flexHeight: Boolean,
    bodyStyle: Object as PropType<CSSProperties>
  },
  setup(props) {
    const {
      slots: dataTableSlots,
      bodyWidthRef,
      mergedExpandedRowKeysRef,
      mergedClsPrefixRef,
      mergedThemeRef,
      scrollXRef,
      colsRef,
      paginatedDataRef,
      rawPaginatedDataRef,
      fixedColumnLeftMapRef,
      fixedColumnRightMapRef,
      mergedCurrentPageRef,
      rowClassNameRef,
      leftActiveFixedColKeyRef,
      leftActiveFixedChildrenColKeysRef,
      rightActiveFixedColKeyRef,
      rightActiveFixedChildrenColKeysRef,
      renderExpandRef,
      hoverKeyRef,
      summaryRef,
      mergedSortStateRef,
      virtualScrollRef,
      virtualScrollXRef,
      heightForRowRef,
      minRowHeightRef,
      componentId,
      mergedTableLayoutRef,
      childTriggerColIndexRef,
      indentRef,
      rowPropsRef,
      maxHeightRef,
      stripedRef,
      loadingRef,
      onLoadRef,
      loadingKeySetRef,
      expandableRef,
      stickyExpandedRowsRef,
      renderExpandIconRef,
      summaryPlacementRef,
      treeMateRef,
      scrollbarPropsRef,
      setHeaderScrollLeft,
      doUpdateExpandedRowKeys,
      handleTableBodyScroll,
      doCheck,
      doUncheck,
      renderCell
    } = inject(dataTableInjectionKey)!
    const NConfigProvider = inject(configProviderInjectionKey)
    const scrollbarInstRef = ref<ScrollbarInst | null>(null)
    const virtualListRef = ref<VirtualListInst | null>(null)
    const emptyElRef = ref<HTMLElement | null>(null)
    const emptyRef = useMemo(() => paginatedDataRef.value.length === 0)
    // If header is not inside & empty is displayed, no table part would be
    // shown. So to collect a body width, we need to put a ref on empty element
    const shouldDisplaySomeTablePartRef = useMemo(
      () => props.showHeader || !emptyRef.value
    )
    // If no body is shown, we shouldn't show scrollbar
    const bodyShowHeaderOnlyRef = useMemo(() => {
      return props.showHeader || emptyRef.value
    })
    let lastSelectedKey: string | number = ''
    const mergedExpandedRowKeySetRef = computed(() => {
      return new Set(mergedExpandedRowKeysRef.value)
    })
    function getRowInfo(key: RowKey): RowData | undefined {
      return treeMateRef.value.getNode(key)?.rawNode
    }
    function handleCheckboxUpdateChecked(
      tmNode: { key: RowKey },
      checked: boolean,
      shiftKey: boolean
    ): void {
      const rowInfo = getRowInfo(tmNode.key)
      if (!rowInfo) {
        warn('data-table', `fail to get row data with key ${tmNode.key}`)
        return
      }
      if (shiftKey) {
        const lastIndex = paginatedDataRef.value.findIndex(
          item => item.key === lastSelectedKey
        )
        if (lastIndex !== -1) {
          const currentIndex = paginatedDataRef.value.findIndex(
            item => item.key === tmNode.key
          )
          const start = Math.min(lastIndex, currentIndex)
          const end = Math.max(lastIndex, currentIndex)
          const rowKeysToCheck: RowKey[] = []
          paginatedDataRef.value.slice(start, end + 1).forEach((r) => {
            if (!r.disabled) {
              rowKeysToCheck.push(r.key)
            }
          })
          if (checked) {
            doCheck(rowKeysToCheck, false, rowInfo)
          }
          else {
            doUncheck(rowKeysToCheck, rowInfo)
          }
          lastSelectedKey = tmNode.key
          return
        }
      }
      if (checked) {
        doCheck(tmNode.key, false, rowInfo)
      }
      else {
        doUncheck(tmNode.key, rowInfo)
      }
      lastSelectedKey = tmNode.key
    }

    function handleRadioUpdateChecked(tmNode: { key: RowKey }): void {
      const rowInfo = getRowInfo(tmNode.key)
      if (!rowInfo) {
        warn('data-table', `fail to get row data with key ${tmNode.key}`)
        return
      }
      doCheck(tmNode.key, true, rowInfo)
    }

    function getScrollContainer(): HTMLElement | null {
      if (!shouldDisplaySomeTablePartRef.value) {
        const { value: emptyEl } = emptyElRef
        if (emptyEl) {
          return emptyEl
        }
        else {
          return null
        }
      }
      if (virtualScrollRef.value) {
        return virtualListContainer()
      }
      const { value } = scrollbarInstRef
      if (value)
        return value.containerRef
      return null
    }
    // For table row with children, tmNode is non-nullable
    // For table row is expandable but is not tree data, tmNode is null
    function handleUpdateExpanded(key: RowKey, tmNode: TmNode | null): void {
      if (loadingKeySetRef.value.has(key))
        return
      const { value: mergedExpandedRowKeys } = mergedExpandedRowKeysRef
      const index = mergedExpandedRowKeys.indexOf(key)
      const nextExpandedKeys = Array.from(mergedExpandedRowKeys)
      if (~index) {
        nextExpandedKeys.splice(index, 1)
        doUpdateExpandedRowKeys(nextExpandedKeys)
      }
      else {
        if (tmNode && !tmNode.isLeaf && !tmNode.shallowLoaded) {
          loadingKeySetRef.value.add(key)
          void onLoadRef
            .value?.(tmNode.rawNode)
            .then(() => {
              const { value: futureMergedExpandedRowKeys }
                = mergedExpandedRowKeysRef
              const futureNextExpandedKeys = Array.from(
                futureMergedExpandedRowKeys
              )
              const index = futureNextExpandedKeys.indexOf(key)
              if (!~index) {
                futureNextExpandedKeys.push(key)
              }
              doUpdateExpandedRowKeys(futureNextExpandedKeys)
            })
            .finally(() => {
              loadingKeySetRef.value.delete(key)
            })
        }
        else {
          nextExpandedKeys.push(key)
          doUpdateExpandedRowKeys(nextExpandedKeys)
        }
      }
    }
    function handleMouseleaveTable(): void {
      hoverKeyRef.value = null
    }
    function virtualListContainer(): HTMLElement | null {
      const { value } = virtualListRef
      return value?.listElRef || null
    }
    function virtualListContent(): HTMLElement | null {
      const { value } = virtualListRef
      return value?.itemsElRef || null
    }
    function handleVirtualListScroll(e: Event): void {
      handleTableBodyScroll(e)
      scrollbarInstRef.value?.sync()
    }
    function handleVirtualListResize(e: ResizeObserverEntry): void {
      const { onResize } = props
      if (onResize)
        onResize(e)
      scrollbarInstRef.value?.sync()
    }
    const exposedMethods: MainTableBodyRef = {
      getScrollContainer,
      scrollTo(arg0: any, arg1?: any) {
        if (virtualScrollRef.value) {
          virtualListRef.value?.scrollTo(arg0, arg1)
        }
        else {
          scrollbarInstRef.value?.scrollTo(arg0, arg1)
        }
      }
    }

    // manually control shadow style to avoid rerender
    const style = c([
      ({ props: cProps }: { props: StyleCProps }) => {
        const createActiveLeftFixedStyle = (
          leftActiveFixedColKey: ColumnKey | null
        ): CNode | null => {
          if (leftActiveFixedColKey === null)
            return null
          return c(
            `[data-n-id="${cProps.componentId}"] [data-col-key="${leftActiveFixedColKey}"]::after`,
            { boxShadow: 'var(--n-box-shadow-after)' }
          )
        }

        const createActiveRightFixedStyle = (
          rightActiveFixedColKey: ColumnKey | null
        ): CNode | null => {
          if (rightActiveFixedColKey === null)
            return null
          return c(
            `[data-n-id="${cProps.componentId}"] [data-col-key="${rightActiveFixedColKey}"]::before`,
            { boxShadow: 'var(--n-box-shadow-before)' }
          )
        }

        return c([
          createActiveLeftFixedStyle(cProps.leftActiveFixedColKey),
          createActiveRightFixedStyle(cProps.rightActiveFixedColKey),
          cProps.leftActiveFixedChildrenColKeys.map(leftActiveFixedColKey =>
            createActiveLeftFixedStyle(leftActiveFixedColKey)
          ),
          cProps.rightActiveFixedChildrenColKeys.map(rightActiveFixedColKey =>
            createActiveRightFixedStyle(rightActiveFixedColKey)
          )
        ])
      }
    ])
    let fixedStyleMounted = false
    watchEffect(() => {
      const { value: leftActiveFixedColKey } = leftActiveFixedColKeyRef
      const { value: leftActiveFixedChildrenColKeys }
        = leftActiveFixedChildrenColKeysRef
      const { value: rightActiveFixedColKey } = rightActiveFixedColKeyRef
      const { value: rightActiveFixedChildrenColKeys }
        = rightActiveFixedChildrenColKeysRef
      if (
        !fixedStyleMounted
        && leftActiveFixedColKey === null
        && rightActiveFixedColKey === null
      ) {
        return
      }

      const cProps: StyleCProps = {
        leftActiveFixedColKey,
        leftActiveFixedChildrenColKeys,
        rightActiveFixedColKey,
        rightActiveFixedChildrenColKeys,
        componentId
      }
      style.mount({
        id: `n-${componentId}`,
        force: true,
        props: cProps,
        anchorMetaName: cssrAnchorMetaName,
        parent: NConfigProvider?.styleMountTarget
      })
      fixedStyleMounted = true
    })
    onUnmounted(() => {
      style.unmount({
        id: `n-${componentId}`,
        parent: NConfigProvider?.styleMountTarget
      })
    })
    return {
      bodyWidth: bodyWidthRef,
      summaryPlacement: summaryPlacementRef,
      dataTableSlots,
      componentId,
      scrollbarInstRef,
      virtualListRef,
      emptyElRef,
      summary: summaryRef,
      mergedClsPrefix: mergedClsPrefixRef,
      mergedTheme: mergedThemeRef,
      scrollX: scrollXRef,
      cols: colsRef,
      loading: loadingRef,
      bodyShowHeaderOnly: bodyShowHeaderOnlyRef,
      shouldDisplaySomeTablePart: shouldDisplaySomeTablePartRef,
      empty: emptyRef,
      paginatedDataAndInfo: computed(() => {
        const { value: striped } = stripedRef
        let hasChildren = false
        const data = paginatedDataRef.value.map(
          striped
            ? (tmNode, index) => {
                if (!tmNode.isLeaf)
                  hasChildren = true
                return {
                  tmNode,
                  key: tmNode.key,
                  striped: index % 2 === 1,
                  index
                }
              }
            : (tmNode, index) => {
                if (!tmNode.isLeaf)
                  hasChildren = true
                return {
                  tmNode,
                  key: tmNode.key,
                  striped: false,
                  index
                }
              }
        )
        return {
          data,
          hasChildren
        }
      }),
      rawPaginatedData: rawPaginatedDataRef,
      fixedColumnLeftMap: fixedColumnLeftMapRef,
      fixedColumnRightMap: fixedColumnRightMapRef,
      currentPage: mergedCurrentPageRef,
      rowClassName: rowClassNameRef,
      renderExpand: renderExpandRef,
      mergedExpandedRowKeySet: mergedExpandedRowKeySetRef,
      hoverKey: hoverKeyRef,
      mergedSortState: mergedSortStateRef,
      virtualScroll: virtualScrollRef,
      virtualScrollX: virtualScrollXRef,
      heightForRow: heightForRowRef,
      minRowHeight: minRowHeightRef,
      mergedTableLayout: mergedTableLayoutRef,
      childTriggerColIndex: childTriggerColIndexRef,
      indent: indentRef,
      rowProps: rowPropsRef,
      maxHeight: maxHeightRef,
      loadingKeySet: loadingKeySetRef,
      expandable: expandableRef,
      stickyExpandedRows: stickyExpandedRowsRef,
      renderExpandIcon: renderExpandIconRef,
      scrollbarProps: scrollbarPropsRef,
      setHeaderScrollLeft,
      handleVirtualListScroll,
      handleVirtualListResize,
      handleMouseleaveTable,
      virtualListContainer,
      virtualListContent,
      handleTableBodyScroll,
      handleCheckboxUpdateChecked,
      handleRadioUpdateChecked,
      handleUpdateExpanded,
      renderCell,
      ...exposedMethods
    }
  },
  render() {
    const {
      mergedTheme,
      scrollX,
      mergedClsPrefix,
      virtualScroll,
      maxHeight,
      mergedTableLayout,
      flexHeight,
      loadingKeySet,
      onResize,
      setHeaderScrollLeft
    } = this
    const scrollable
      = scrollX !== undefined || maxHeight !== undefined || flexHeight

    // For a basic table with auto layout whose content may overflow we will
    // make it scrollable, which differs from browser's native behavior.
    // For native behavior, see
    // https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout
    const isBasicAutoLayout = !scrollable && mergedTableLayout === 'auto'
    const xScrollable = scrollX !== undefined || isBasicAutoLayout

    const contentStyle: CSSProperties = {
      minWidth: formatLength(scrollX) || '100%'
    }
    if (scrollX)
      contentStyle.width = '100%'

    const tableNode = (
      <NScrollbar
        {...this.scrollbarProps}
        ref="scrollbarInstRef"
        scrollable={scrollable || isBasicAutoLayout}
        class={`${mergedClsPrefix}-data-table-base-table-body`}
        style={!this.empty ? this.bodyStyle : undefined}
        theme={mergedTheme.peers.Scrollbar}
        themeOverrides={mergedTheme.peerOverrides.Scrollbar}
        contentStyle={contentStyle}
        container={virtualScroll ? this.virtualListContainer : undefined}
        content={virtualScroll ? this.virtualListContent : undefined}
        horizontalRailStyle={{ zIndex: 3 }}
        verticalRailStyle={{ zIndex: 3 }}
        xScrollable={xScrollable}
        onScroll={virtualScroll ? undefined : this.handleTableBodyScroll}
        internalOnUpdateScrollLeft={setHeaderScrollLeft}
        onResize={onResize}
      >
        {{
          default: () => {
            // coordinate to pass if there are cells that cross row & col
            const cordToPass: Record<number, number[]> = {}
            // coordinate to related hover keys
            const cordKey: Record<number, Record<number, RowKey[]>> = {}
            const {
              cols,
              paginatedDataAndInfo,
              mergedTheme,
              fixedColumnLeftMap,
              fixedColumnRightMap,
              currentPage,
              rowClassName,
              mergedSortState,
              mergedExpandedRowKeySet,
              stickyExpandedRows,
              componentId,
              childTriggerColIndex,
              expandable,
              rowProps,
              handleMouseleaveTable,
              renderExpand,
              summary,
              handleCheckboxUpdateChecked,
              handleRadioUpdateChecked,
              handleUpdateExpanded,
              heightForRow,
              minRowHeight,
              virtualScrollX
            } = this
            const { length: colCount } = cols

            let mergedData: RowRenderInfo[]

            // if there is children in data, we should expand mergedData first

            const { data: paginatedData, hasChildren } = paginatedDataAndInfo

            const mergedPaginationData = hasChildren
              ? flatten(paginatedData, mergedExpandedRowKeySet)
              : paginatedData

            if (summary) {
              const summaryRows = summary(this.rawPaginatedData)
              if (Array.isArray(summaryRows)) {
                const summaryRowData = summaryRows.map((row, i) => ({
                  isSummaryRow: true as const,
                  key: `__n_summary__${i}`,
                  tmNode: {
                    rawNode: row,
                    disabled: true
                  },
                  index: -1
                }))
                mergedData
                  = this.summaryPlacement === 'top'
                    ? [...summaryRowData, ...mergedPaginationData]
                    : [...mergedPaginationData, ...summaryRowData]
              }
              else {
                const summaryRowData = {
                  isSummaryRow: true as const,
                  key: '__n_summary__',
                  tmNode: {
                    rawNode: summaryRows,
                    disabled: true
                  },
                  index: -1
                }
                mergedData
                  = this.summaryPlacement === 'top'
                    ? [summaryRowData, ...mergedPaginationData]
                    : [...mergedPaginationData, summaryRowData]
              }
            }
            else {
              mergedData = mergedPaginationData
            }

            const indentStyle = hasChildren
              ? { width: pxfy(this.indent) }
              : undefined

            // Tile the data of the expanded row
            const displayedData: RowRenderInfo[] = []
            mergedData.forEach((rowInfo) => {
              if (
                renderExpand
                && mergedExpandedRowKeySet.has(rowInfo.key)
                && (!expandable || expandable(rowInfo.tmNode.rawNode))
              ) {
                displayedData.push(rowInfo, {
                  isExpandedRow: true,
                  key: `${rowInfo.key}-expand`, // solve key repeat of the expanded row
                  tmNode: rowInfo.tmNode as TmNode,
                  index: rowInfo.index
                })
              }
              else {
                displayedData.push(rowInfo)
              }
            })

            const { length: rowCount } = displayedData

            const rowIndexToKey: Record<number, RowKey> = {}
            paginatedData.forEach(({ tmNode }, rowIndex) => {
              rowIndexToKey[rowIndex] = tmNode.key
            })

            const bodyWidth = stickyExpandedRows ? this.bodyWidth : null
            const bodyWidthPx
              = bodyWidth === null ? undefined : `${bodyWidth}px`

            const CellComponent = (this.virtualScrollX ? 'div' : 'td') as 'td'
            let leftFixedColsCount = 0
            let rightFixedColsCount = 0
            if (virtualScrollX) {
              cols.forEach((col) => {
                if (col.column.fixed === 'left') {
                  leftFixedColsCount++
                }
                else if (col.column.fixed === 'right') {
                  rightFixedColsCount++
                }
              })
            }

            const renderRow = ({
              // Normal
              rowInfo,
              displayedRowIndex,
              isVirtual,
              // Virtual X
              isVirtualX,
              startColIndex,
              endColIndex,
              getLeft
            }: {
              rowInfo: RowRenderInfo
              displayedRowIndex: number
              isVirtual: boolean
              // for horizontal virtual list
              isVirtualX: boolean
              startColIndex: number
              endColIndex: number
              getLeft: (index: number) => number
            }): VNode => {
              const { index: actualRowIndex } = rowInfo
              if ('isExpandedRow' in rowInfo) {
                const {
                  tmNode: { key, rawNode }
                } = rowInfo
                return (
                  <tr
                    class={`${mergedClsPrefix}-data-table-tr ${mergedClsPrefix}-data-table-tr--expanded`}
                    key={`${key}__expand`}
                  >
                    <td
                      class={[
                        `${mergedClsPrefix}-data-table-td`,
                        `${mergedClsPrefix}-data-table-td--last-col`,
                        displayedRowIndex + 1 === rowCount
                        && `${mergedClsPrefix}-data-table-td--last-row`
                      ]}
                      colspan={colCount}
                    >
                      {stickyExpandedRows ? (
                        <div
                          class={`${mergedClsPrefix}-data-table-expand`}
                          style={{
                            width: bodyWidthPx
                          }}
                        >
                          {renderExpand!(rawNode, actualRowIndex)}
                        </div>
                      ) : (
                        renderExpand!(rawNode, actualRowIndex)
                      )}
                    </td>
                  </tr>
                )
              }
              const isSummary = 'isSummaryRow' in rowInfo
              const striped = !isSummary && rowInfo.striped
              const { tmNode, key: rowKey } = rowInfo
              const { rawNode: rowData } = tmNode
              const expanded = mergedExpandedRowKeySet.has(rowKey)
              const props = rowProps
                ? rowProps(rowData, actualRowIndex)
                : undefined
              const mergedRowClassName
                = typeof rowClassName === 'string'
                  ? rowClassName
                  : createRowClassName(rowData, actualRowIndex, rowClassName)
              const iteratedCols = isVirtualX
                ? cols.filter((col, index) => {
                    if (startColIndex <= index && index <= endColIndex)
                      return true
                    if (col.column.fixed) {
                      return true
                    }
                    return false
                  })
                : cols
              const virtualXRowHeight = isVirtualX
                ? pxfy(heightForRow?.(rowData, actualRowIndex) || minRowHeight)
                : undefined
              const cells = iteratedCols.map((col) => {
                const colIndex = col.index
                if (displayedRowIndex in cordToPass) {
                  const cordOfRowToPass = cordToPass[displayedRowIndex]
                  const indexInCordOfRowToPass
                    = cordOfRowToPass.indexOf(colIndex)
                  if (~indexInCordOfRowToPass) {
                    cordOfRowToPass.splice(indexInCordOfRowToPass, 1)
                    return null
                  }
                }
                // TODO: Simplify row calculation
                const { column } = col
                const colKey = getColKey(col)
                const { rowSpan, colSpan } = column
                const mergedColSpan = isSummary
                  ? rowInfo.tmNode.rawNode[colKey]?.colSpan || 1 // optional for #1276
                  : colSpan
                    ? colSpan(rowData, actualRowIndex)
                    : 1
                const mergedRowSpan = isSummary
                  ? rowInfo.tmNode.rawNode[colKey]?.rowSpan || 1 // optional for #1276
                  : rowSpan
                    ? rowSpan(rowData, actualRowIndex)
                    : 1
                const isLastCol = colIndex + mergedColSpan === colCount
                const isLastRow = displayedRowIndex + mergedRowSpan === rowCount
                const isCrossRowTd = mergedRowSpan > 1
                if (isCrossRowTd) {
                  cordKey[displayedRowIndex] = {
                    [colIndex]: []
                  }
                }
                if (mergedColSpan > 1 || isCrossRowTd) {
                  for (
                    let i = displayedRowIndex;
                    i < displayedRowIndex + mergedRowSpan;
                    ++i
                  ) {
                    if (isCrossRowTd) {
                      cordKey[displayedRowIndex][colIndex].push(
                        rowIndexToKey[i]
                      )
                    }
                    for (let j = colIndex; j < colIndex + mergedColSpan; ++j) {
                      if (i === displayedRowIndex && j === colIndex) {
                        continue
                      }
                      if (!(i in cordToPass)) {
                        cordToPass[i] = [j]
                      }
                      else {
                        cordToPass[i].push(j)
                      }
                    }
                  }
                }
                const hoverKey = isCrossRowTd ? this.hoverKey : null
                const { cellProps } = column
                const resolvedCellProps = cellProps?.(rowData, actualRowIndex)
                const indentOffsetStyle = {
                  '--indent-offset': '' as string | number
                }
                const FinalCellComponent = column.fixed ? 'td' : CellComponent
                return (
                  <FinalCellComponent
                    {...resolvedCellProps}
                    key={colKey}
                    style={[
                      {
                        textAlign: column.align || undefined,
                        width: pxfy(column.width)
                      },
                      isVirtualX && {
                        height: virtualXRowHeight
                      },
                      isVirtualX && !column.fixed
                        ? {
                            position: 'absolute',
                            left: pxfy(getLeft(colIndex)),
                            top: 0,
                            bottom: 0
                          }
                        : {
                            left: pxfy(fixedColumnLeftMap[colKey]?.start),
                            right: pxfy(fixedColumnRightMap[colKey]?.start)
                          },
                      indentOffsetStyle as CSSProperties,
                      resolvedCellProps?.style || ''
                    ]}
                    colspan={mergedColSpan}
                    rowspan={isVirtual ? undefined : mergedRowSpan}
                    data-col-key={colKey}
                    class={[
                      `${mergedClsPrefix}-data-table-td`,
                      column.className,
                      resolvedCellProps?.class,
                      isSummary && `${mergedClsPrefix}-data-table-td--summary`,
                      hoverKey !== null
                      && cordKey[displayedRowIndex][colIndex].includes(
                        hoverKey
                      )
                      && `${mergedClsPrefix}-data-table-td--hover`,
                      isColumnSorting(column, mergedSortState)
                      && `${mergedClsPrefix}-data-table-td--sorting`,
                      column.fixed
                      && `${mergedClsPrefix}-data-table-td--fixed-${column.fixed}`,
                      column.align
                      && `${mergedClsPrefix}-data-table-td--${column.align}-align`,
                      column.type === 'selection'
                      && `${mergedClsPrefix}-data-table-td--selection`,
                      column.type === 'expand'
                      && `${mergedClsPrefix}-data-table-td--expand`,
                      isLastCol && `${mergedClsPrefix}-data-table-td--last-col`,
                      isLastRow && `${mergedClsPrefix}-data-table-td--last-row`
                    ]}
                  >
                    {hasChildren && colIndex === childTriggerColIndex
                      ? [
                          repeat(
                            (indentOffsetStyle['--indent-offset'] = isSummary
                              ? 0
                              : rowInfo.tmNode.level),
                            <div
                              class={`${mergedClsPrefix}-data-table-indent`}
                              style={indentStyle}
                            />
                          ),
                          isSummary || rowInfo.tmNode.isLeaf ? (
                            <div
                              class={`${mergedClsPrefix}-data-table-expand-placeholder`}
                            />
                          ) : (
                            <ExpandTrigger
                              class={`${mergedClsPrefix}-data-table-expand-trigger`}
                              clsPrefix={mergedClsPrefix}
                              expanded={expanded}
                              rowData={rowData}
                              renderExpandIcon={this.renderExpandIcon}
                              loading={loadingKeySet.has(rowInfo.key)}
                              onClick={() => {
                                handleUpdateExpanded(rowKey, rowInfo.tmNode)
                              }}
                            />
                          )
                        ]
                      : null}
                    {column.type === 'selection' ? (
                      !isSummary ? (
                        column.multiple === false ? (
                          <RenderSafeRadio
                            key={currentPage}
                            rowKey={rowKey}
                            disabled={rowInfo.tmNode.disabled}
                            onUpdateChecked={() => {
                              handleRadioUpdateChecked(rowInfo.tmNode)
                            }}
                          />
                        ) : (
                          <RenderSafeCheckbox
                            key={currentPage}
                            rowKey={rowKey}
                            disabled={rowInfo.tmNode.disabled}
                            onUpdateChecked={(checked: boolean, e) => {
                              handleCheckboxUpdateChecked(
                                rowInfo.tmNode,
                                checked,
                                e.shiftKey
                              )
                            }}
                          />
                        )
                      ) : null
                    ) : column.type === 'expand' ? (
                      !isSummary ? (
                        !column.expandable || column.expandable?.(rowData) ? (
                          <ExpandTrigger
                            clsPrefix={mergedClsPrefix}
                            rowData={rowData}
                            expanded={expanded}
                            renderExpandIcon={this.renderExpandIcon}
                            onClick={() => {
                              handleUpdateExpanded(rowKey, null)
                            }}
                          />
                        ) : null
                      ) : null
                    ) : (
                      <Cell
                        clsPrefix={mergedClsPrefix}
                        index={actualRowIndex}
                        row={rowData}
                        column={column}
                        isSummary={isSummary}
                        mergedTheme={mergedTheme}
                        renderCell={this.renderCell}
                      />
                    )}
                  </FinalCellComponent>
                )
              })

              if (isVirtualX) {
                if (leftFixedColsCount && rightFixedColsCount) {
                  cells.splice(
                    leftFixedColsCount,
                    0,
                    <td
                      colspan={
                        cols.length - leftFixedColsCount - rightFixedColsCount
                      }
                      style={{
                        pointerEvents: 'none',
                        visibility: 'hidden',
                        height: 0
                      }}
                    />
                  )
                }
              }

              const row = (
                <tr
                  {...props}
                  onMouseenter={(e) => {
                    this.hoverKey = rowKey
                    props?.onMouseenter?.(e)
                  }}
                  key={rowKey}
                  class={[
                    `${mergedClsPrefix}-data-table-tr`,
                    isSummary && `${mergedClsPrefix}-data-table-tr--summary`,
                    striped && `${mergedClsPrefix}-data-table-tr--striped`,
                    expanded && `${mergedClsPrefix}-data-table-tr--expanded`,
                    mergedRowClassName,
                    props?.class
                  ]}
                  style={[
                    props?.style,
                    isVirtualX && { height: virtualXRowHeight }
                  ]}
                >
                  {cells}
                </tr>
              )
              return row
            }

            if (!virtualScroll) {
              return (
                <table
                  class={`${mergedClsPrefix}-data-table-table`}
                  onMouseleave={handleMouseleaveTable}
                  style={{
                    tableLayout: this.mergedTableLayout
                  }}
                >
                  <colgroup>
                    {cols.map(col => (
                      <col key={col.key} style={col.style}></col>
                    ))}
                  </colgroup>
                  {this.showHeader ? <TableHeader discrete={false} /> : null}
                  {!this.empty ? (
                    <tbody
                      data-n-id={componentId}
                      class={`${mergedClsPrefix}-data-table-tbody`}
                    >
                      {displayedData.map((rowInfo, displayedRowIndex) => {
                        return renderRow({
                          rowInfo,
                          displayedRowIndex,
                          isVirtual: false,
                          isVirtualX: false,
                          startColIndex: -1,
                          endColIndex: -1,
                          getLeft(_index) {
                            return -1
                          }
                        })
                      })}
                    </tbody>
                  ) : null}
                </table>
              )
            }
            else {
              return (
                <VirtualList
                  ref="virtualListRef"
                  items={displayedData}
                  itemSize={this.minRowHeight}
                  visibleItemsTag={VirtualListItemWrapper}
                  visibleItemsProps={{
                    clsPrefix: mergedClsPrefix,
                    id: componentId,
                    cols,
                    onMouseleave: handleMouseleaveTable
                  }}
                  showScrollbar={false}
                  onResize={this.handleVirtualListResize}
                  onScroll={this.handleVirtualListScroll}
                  itemsStyle={contentStyle}
                  itemResizable={!virtualScrollX}
                  columns={cols}
                  renderItemWithCols={
                    virtualScrollX
                      ? ({
                          itemIndex,
                          item,
                          startColIndex,
                          endColIndex,
                          getLeft
                        }) => {
                          return renderRow({
                            displayedRowIndex: itemIndex,
                            isVirtual: true,
                            isVirtualX: true,
                            rowInfo: item as RowRenderInfo,
                            startColIndex,
                            endColIndex,
                            getLeft
                          })
                        }
                      : undefined
                  }
                >
                  {{
                    default: ({
                      item,
                      index,
                      renderedItemWithCols
                    }: {
                      item: RowRenderInfo
                      index: number
                      renderedItemWithCols: VNodeChild
                    }) => {
                      if (renderedItemWithCols)
                        return renderedItemWithCols
                      return renderRow({
                        rowInfo: item,
                        displayedRowIndex: index,
                        isVirtual: true,
                        isVirtualX: false,
                        startColIndex: 0,
                        endColIndex: 0,
                        getLeft(_index) {
                          return 0
                        }
                      })
                    }
                  }}
                </VirtualList>
              )
            }
          }
        }}
      </NScrollbar>
    )

    if (this.empty) {
      const createEmptyNode = (): VNode => (
        <div
          class={[
            `${mergedClsPrefix}-data-table-empty`,
            this.loading && `${mergedClsPrefix}-data-table-empty--hide`
          ]}
          style={this.bodyStyle}
          ref="emptyElRef"
        >
          {resolveSlot(this.dataTableSlots.empty, () => [
            <NEmpty
              theme={this.mergedTheme.peers.Empty}
              themeOverrides={this.mergedTheme.peerOverrides.Empty}
            />
          ])}
        </div>
      )
      if (this.shouldDisplaySomeTablePart) {
        return (
          <>
            {tableNode}
            {createEmptyNode()}
          </>
        )
      }
      else {
        return (
          <VResizeObserver onResize={this.onResize}>
            {{ default: createEmptyNode }}
          </VResizeObserver>
        )
      }
    }
    return tableNode
  }
})
