import { onMounted, onUnmounted } from "vue"

export function usePreventScroll() {
    // 阻止默认滚动行为的处理函数
    const preventScroll = (e: Event) => {
        e.preventDefault()
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