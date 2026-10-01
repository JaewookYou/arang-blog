import type { Locale } from "@/lib/i18n";

/**
 * 언어 전환 (클라이언트)
 * 쿠키를 바꾸고, 주소에 ?lang= 이 있으면 지운 주소로 이동한다.
 * (?lang= 이 남아 있으면 middleware가 다시 그 언어로 되돌리기 때문)
 * @returns 주소를 이동했으면 true — 호출한 쪽은 새로고침할 필요가 없다
 */
export function applyLocaleSwitch(locale: Locale): boolean {
    document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    window.dispatchEvent(new CustomEvent("localeChange", { detail: { locale } }));

    const url = new URL(window.location.href);
    if (url.searchParams.has("lang")) {
        url.searchParams.delete("lang");
        window.location.replace(url.toString());
        return true;
    }
    return false;
}
