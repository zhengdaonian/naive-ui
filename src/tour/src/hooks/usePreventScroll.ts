import { onMounted, onUnmounted, Ref } from "vue"

export function usePreventScroll(lockRef: Ref<boolean>) {
    // 阻止默认滚动行为的处理函数
    const preventScroll = (e: Event) => {
        if (lockRef.value) {
            e.preventDefault()
        }
    }

    onMounted(() => {
        window.addEventListener('wheel', preventScroll, { passive: false })
        window.addEventListener('touchmove', preventScroll, { passive: false })
    })
    
    onUnmounted(() => {
        window.removeEventListener('wheel', preventScroll)
        window.removeEventListener('touchmove', preventScroll)
    })
}