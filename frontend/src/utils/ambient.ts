import { unstable_cache } from 'next/cache'
import { decode } from 'jpeg-js'

/**
 * Extract a saturation-weighted dominant color from a TMDB image.
 */
export const getAmbientColor = unstable_cache(async (path: string | null | undefined): Promise<string | null> => {
    if (!path) return null
    try {
        const res = await fetch(`https://image.tmdb.org/t/p/w92${path}`, { next: { revalidate: 86400 } })
        if (!res.ok) return null
        const buf = new Uint8Array(await res.arrayBuffer())
        const { data } = decode(buf, { useTArray: true, maxMemoryUsageInMB: 16 })

        let r = 0, g = 0, b = 0, weightSum = 0
        for (let i = 0; i < data.length; i += 16) {
            const pr = data[i], pg = data[i + 1], pb = data[i + 2]
            const max = Math.max(pr, pg, pb)
            const min = Math.min(pr, pg, pb)
            const saturation = max === 0 ? 0 : (max - min) / max
            const luminance = max / 255
            const weight = saturation * saturation * luminance + 0.001
            r += pr * weight
            g += pg * weight
            b += pb * weight
            weightSum += weight
        }
        if (!weightSum) return null

        const { l, c, h } = srgbToOklch(r / weightSum, g / weightSum, b / weightSum)
        if (c < 0.015) return null

        const clampedL = Math.min(Math.max(l, 0.55), 0.75)
        const clampedC = Math.min(Math.max(c * 1.4, 0.05), 0.19)
        return `oklch(${clampedL.toFixed(3)} ${clampedC.toFixed(3)} ${h.toFixed(1)})`
    } catch {
        return null
    }
}, ['ambient-color'], { revalidate: false })

function srgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
    const toLinear = (v: number) => {
        v /= 255
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    }
    const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b)

    const lRoot = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
    const mRoot = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
    const sRoot = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)

    const l = 0.2104542553 * lRoot + 0.7936177850 * mRoot - 0.0040720468 * sRoot
    const a = 1.9779984951 * lRoot - 2.4285922050 * mRoot + 0.4505937099 * sRoot
    const bb = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.8086757660 * sRoot

    const c = Math.sqrt(a * a + bb * bb)
    let h = Math.atan2(bb, a) * 180 / Math.PI
    if (h < 0) h += 360
    return { l, c, h }
}
